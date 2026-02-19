import {
  Controller,
  Post,
  Req,
  Headers,
  HttpCode,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { Request } from 'express';
import { StripeService } from './stripe.service';
import { PrismaService } from '../../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import { DonationStatus, FundraiserStatus, TaxReceiptStatus } from '@prisma/client';
import Stripe from 'stripe';

@Controller('webhooks')
export class StripeWebhookController {
  private readonly logger = new Logger(StripeWebhookController.name);

  // In-memory set for idempotence (in production, use Redis or DB)
  private processedEvents = new Set<string>();

  constructor(
    private readonly stripeService: StripeService,
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
  ) {}

  @Post('stripe')
  @HttpCode(200)
  async handleWebhook(
    @Req() req: Request,
    @Headers('stripe-signature') signature: string,
  ) {
    if (!signature) {
      throw new BadRequestException('Signature Stripe manquante');
    }

    const rawBody = (req as any).rawBody;
    if (!rawBody) {
      throw new BadRequestException('Raw body manquant');
    }

    const event = this.stripeService.constructWebhookEvent(rawBody, signature);

    // Idempotence check
    if (this.processedEvents.has(event.id)) {
      this.logger.log(`Event ${event.id} already processed, skipping`);
      return { received: true };
    }

    this.logger.log(`Processing Stripe event: ${event.type} (${event.id})`);

    try {
      switch (event.type) {
        case 'checkout.session.completed':
          await this.handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session);
          break;

        case 'payment_intent.succeeded':
          await this.handlePaymentIntentSucceeded(event.data.object as Stripe.PaymentIntent);
          break;

        case 'payment_intent.payment_failed':
          await this.handlePaymentIntentFailed(event.data.object as Stripe.PaymentIntent);
          break;

        case 'charge.refunded':
          await this.handleChargeRefunded(event.data.object as Stripe.Charge);
          break;

        case 'charge.dispute.created':
          await this.handleChargeDisputed(event.data.object as Stripe.Dispute);
          break;

        case 'account.updated':
          await this.handleAccountUpdated(event.data.object as Stripe.Account);
          break;

        default:
          this.logger.log(`Unhandled event type: ${event.type}`);
      }

      this.processedEvents.add(event.id);

      // Cleanup old events (keep max 10000)
      if (this.processedEvents.size > 10000) {
        const entries = Array.from(this.processedEvents);
        entries.slice(0, 5000).forEach((e) => this.processedEvents.delete(e));
      }
    } catch (error: any) {
      this.logger.error(`Error processing event ${event.type}: ${error.message}`, error.stack);
      // Still return 200 to avoid Stripe retrying
    }

    return { received: true };
  }

  /**
   * Handle checkout.session.completed
   * - "donation" type: mark donation COMPLETED, increment fundraiser currentAmount
   * - "plan" type: mark fundraiser openingFeePaid, set status ACTIVE
   */
  private async handleCheckoutCompleted(session: Stripe.Checkout.Session) {
    const metadata = session.metadata || {};
    const type = metadata.type;

    if (type === 'donation') {
      const donationId = metadata.donation_id;
      if (!donationId) {
        this.logger.warn('checkout.session.completed: missing donation_id in metadata');
        return;
      }

      const donation = await this.prisma.donation.findUnique({
        where: { id: donationId },
        include: { fundraiser: true },
      });

      if (!donation) {
        this.logger.warn(`Donation ${donationId} not found`);
        return;
      }

      if (donation.status === DonationStatus.COMPLETED) {
        this.logger.log(`Donation ${donationId} already completed`);
        return;
      }

      // Update donation status and save Stripe session ID
      await this.prisma.donation.update({
        where: { id: donationId },
        data: {
          status: DonationStatus.COMPLETED,
          stripeSessionId: session.id,
          stripePaymentIntentId: typeof session.payment_intent === 'string'
            ? session.payment_intent
            : (session.payment_intent as Stripe.PaymentIntent)?.id || null,
        },
      });

      // Update tip status if exists
      await this.prisma.tip.updateMany({
        where: { donationId },
        data: { status: 'COMPLETED' },
      });

      // Increment fundraiser currentAmount
      await this.prisma.fundraiser.update({
        where: { id: donation.fundraiserId },
        data: {
          currentAmount: { increment: donation.amount },
        },
      });

      // If fundraiser has a max and currentAmount >= maxAmount, mark as COMPLETED
      const updated = await this.prisma.fundraiser.findUnique({
        where: { id: donation.fundraiserId },
      });
      if (updated && updated.currentAmount >= updated.maxAmount) {
        await this.prisma.fundraiser.update({
          where: { id: donation.fundraiserId },
          data: { status: FundraiserStatus.COMPLETED },
        });
      }

      // Auto-generate tax receipt if org is tax eligible and donor wants it
      if (
        donation.wantsReceipt &&
        donation.fundraiser.organizationId &&
        donation.fundraiser.type === 'ASSOCIATION'
      ) {
        await this.generateTaxReceipt(donation.id, donation.fundraiser.organizationId);
      }

      await this.audit.log(null, 'donation.completed', 'Donation', donationId, {
        amount: donation.amount,
        fundraiserId: donation.fundraiserId,
      });

      this.logger.log(`Donation ${donationId} completed, amount: ${donation.amount}`);
    } else if (type === 'plan') {
      const fundraiserId = metadata.fundraiser_id;
      if (!fundraiserId) {
        this.logger.warn('checkout.session.completed: missing fundraiser_id for plan');
        return;
      }

      await this.prisma.fundraiser.update({
        where: { id: fundraiserId },
        data: {
          openingFeePaid: true,
          status: FundraiserStatus.ACTIVE,
        },
      });

      await this.audit.log(metadata.user_id || null, 'plan.paid', 'Fundraiser', fundraiserId);

      this.logger.log(`Plan payment completed for fundraiser ${fundraiserId}`);
    }
  }

  /**
   * Handle payment_intent.succeeded (backup for checkout.session.completed)
   */
  private async handlePaymentIntentSucceeded(paymentIntent: Stripe.PaymentIntent) {
    const donationId = paymentIntent.metadata?.donation_id;
    if (!donationId) return;

    const donation = await this.prisma.donation.findUnique({ where: { id: donationId } });
    if (!donation || donation.status === DonationStatus.COMPLETED) return;

    // This is a backup - normally handled by checkout.session.completed
    this.logger.log(`payment_intent.succeeded for donation ${donationId} (backup handling)`);
  }

  /**
   * Handle payment_intent.payment_failed
   */
  private async handlePaymentIntentFailed(paymentIntent: Stripe.PaymentIntent) {
    const donationId = paymentIntent.metadata?.donation_id;
    if (!donationId) return;

    await this.prisma.donation.update({
      where: { id: donationId },
      data: { status: DonationStatus.FAILED },
    });

    await this.audit.log(null, 'donation.failed', 'Donation', donationId, {
      reason: paymentIntent.last_payment_error?.message,
    });

    this.logger.log(`Donation ${donationId} payment failed`);
  }

  /**
   * Handle charge.refunded - mark donation REFUNDED, decrement currentAmount
   */
  private async handleChargeRefunded(charge: Stripe.Charge) {
    const paymentIntentId = typeof charge.payment_intent === 'string'
      ? charge.payment_intent
      : (charge.payment_intent as Stripe.PaymentIntent)?.id;

    if (!paymentIntentId) return;

    const donation = await this.prisma.donation.findFirst({
      where: { stripePaymentIntentId: paymentIntentId },
    });

    if (!donation || donation.status === DonationStatus.REFUNDED) return;

    // Mark donation as refunded
    await this.prisma.donation.update({
      where: { id: donation.id },
      data: { status: DonationStatus.REFUNDED },
    });

    // Decrement fundraiser currentAmount
    await this.prisma.fundraiser.update({
      where: { id: donation.fundraiserId },
      data: {
        currentAmount: { decrement: donation.amount },
      },
    });

    // Cancel tax receipt if exists
    await this.prisma.taxReceipt.updateMany({
      where: { donationId: donation.id },
      data: { status: TaxReceiptStatus.CANCELLED },
    });

    await this.audit.log(null, 'donation.refunded', 'Donation', donation.id, {
      amount: donation.amount,
    });

    this.logger.log(`Donation ${donation.id} refunded, amount: ${donation.amount}`);
  }

  /**
   * Handle charge.dispute.created - mark donation DISPUTED
   */
  private async handleChargeDisputed(dispute: Stripe.Dispute) {
    const charge = dispute.charge;
    const chargeId = typeof charge === 'string' ? charge : charge?.id;

    if (!chargeId) return;

    // Find donation by payment intent
    const paymentIntentId = typeof dispute.payment_intent === 'string'
      ? dispute.payment_intent
      : (dispute.payment_intent as Stripe.PaymentIntent)?.id;

    if (!paymentIntentId) return;

    const donation = await this.prisma.donation.findFirst({
      where: { stripePaymentIntentId: paymentIntentId },
    });

    if (!donation) return;

    await this.prisma.donation.update({
      where: { id: donation.id },
      data: { status: DonationStatus.DISPUTED },
    });

    await this.audit.log(null, 'donation.disputed', 'Donation', donation.id, {
      reason: dispute.reason,
    });

    this.logger.log(`Donation ${donation.id} disputed, reason: ${dispute.reason}`);
  }

  /**
   * Handle account.updated - update organization onboarding status
   */
  private async handleAccountUpdated(account: Stripe.Account) {
    const org = await this.prisma.organization.findFirst({
      where: { stripeAccountId: account.id },
    });

    if (!org) return;

    const isOnboarded = !!(account.charges_enabled && account.payouts_enabled);

    if (org.isOnboarded !== isOnboarded) {
      await this.prisma.organization.update({
        where: { id: org.id },
        data: { isOnboarded },
      });

      await this.audit.log(org.ownerUserId, 'organization.onboarding_updated', 'Organization', org.id, {
        chargesEnabled: account.charges_enabled,
        payoutsEnabled: account.payouts_enabled,
      });

      this.logger.log(`Organization ${org.id} onboarding status updated to ${isOnboarded}`);
    }
  }

  /**
   * Auto-generate a tax receipt for a completed donation.
   */
  private async generateTaxReceipt(donationId: string, organizationId: string) {
    try {
      const org = await this.prisma.organization.findUnique({
        where: { id: organizationId },
      });

      if (!org || !org.isTaxEligible) return;

      const currentYear = new Date().getFullYear();

      // Increment receipt counter atomically
      const counter = await this.prisma.receiptCounter.upsert({
        where: {
          organizationId_year: {
            organizationId,
            year: currentYear,
          },
        },
        update: {
          counter: { increment: 1 },
        },
        create: {
          organizationId,
          year: currentYear,
          counter: 1,
        },
      });

      const receiptNumber = `CERFA-${currentYear}-${String(counter.counter).padStart(6, '0')}`;

      await this.prisma.taxReceipt.create({
        data: {
          organizationId,
          donationId,
          receiptNumber,
          status: TaxReceiptStatus.PENDING,
        },
      });

      this.logger.log(`Tax receipt ${receiptNumber} created for donation ${donationId}`);
    } catch (error: any) {
      this.logger.error(`Error generating tax receipt: ${error.message}`);
    }
  }
}
