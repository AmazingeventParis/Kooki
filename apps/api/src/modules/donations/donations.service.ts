import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { StripeService } from '../stripe/stripe.service';
import { AuditService } from '../audit/audit.service';
import { createDonationCheckoutSchema, validateTip } from '@kooki/shared';
import { DonationStatus, FundraiserStatus } from '@prisma/client';

@Injectable()
export class DonationsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly stripe: StripeService,
    private readonly audit: AuditService,
  ) {}

  /**
   * Create a donation checkout session.
   * Validates input, creates a Donation record in PENDING state,
   * creates an optional Tip record, and returns a Stripe Checkout URL.
   */
  async createCheckout(body: unknown) {
    const parsed = createDonationCheckoutSchema.safeParse(body);
    if (!parsed.success) {
      throw new BadRequestException(parsed.error.errors.map((e) => e.message).join(', '));
    }

    const {
      fundraiserId,
      amount,
      donorName,
      donorEmail,
      donorMessage,
      isAnonymous,
      wantsReceipt,
      donorAddress,
      tipAmount: rawTipAmount,
    } = parsed.data;

    // Find fundraiser
    const fundraiser = await this.prisma.fundraiser.findUnique({
      where: { id: fundraiserId },
      include: {
        organization: true,
      },
    });

    if (!fundraiser) {
      throw new NotFoundException('Cagnotte non trouvee');
    }

    if (fundraiser.status !== FundraiserStatus.ACTIVE) {
      throw new BadRequestException('Cette cagnotte n\'accepte plus de dons');
    }

    // Check if donation would exceed max amount
    if (fundraiser.currentAmount + amount > fundraiser.maxAmount) {
      throw new BadRequestException(
        `Le montant depasse le plafond de la cagnotte. Maximum restant: ${fundraiser.maxAmount - fundraiser.currentAmount} centimes`,
      );
    }

    // Validate and cap tip
    const tipAmount = rawTipAmount ? validateTip(rawTipAmount) : 0;

    // Validate receipt requirements
    if (wantsReceipt && !donorAddress) {
      throw new BadRequestException('L\'adresse est requise pour un recu fiscal');
    }

    if (wantsReceipt && fundraiser.type !== 'ASSOCIATION') {
      throw new BadRequestException('Les recus fiscaux ne sont disponibles que pour les collectes associatives');
    }

    // Create donation record in PENDING status
    const donation = await this.prisma.donation.create({
      data: {
        fundraiserId,
        amount,
        currency: fundraiser.currency,
        donorName,
        donorEmail,
        donorMessage,
        isAnonymous,
        wantsReceipt,
        donorAddress,
        status: DonationStatus.PENDING,
      },
    });

    // Create tip record if tip > 0
    if (tipAmount > 0) {
      await this.prisma.tip.create({
        data: {
          donationId: donation.id,
          amount: tipAmount,
          strategyVersion: 'v1',
        },
      });
    }

    // Determine connected account for ASSOCIATION fundraisers
    let connectedAccountId: string | undefined;
    if (fundraiser.type === 'ASSOCIATION' && fundraiser.organization?.stripeAccountId) {
      connectedAccountId = fundraiser.organization.stripeAccountId;
    }

    // Create Stripe Checkout session
    const checkoutSession = await this.stripe.createDonationCheckout({
      donationId: donation.id,
      fundraiserId: fundraiser.id,
      fundraiserSlug: fundraiser.slug,
      fundraiserType: fundraiser.type,
      amount,
      tipAmount,
      currency: fundraiser.currency,
      donorEmail,
      donorName,
      connectedAccountId,
    });

    // Save Stripe session ID on the donation
    await this.prisma.donation.update({
      where: { id: donation.id },
      data: { stripeSessionId: checkoutSession.sessionId },
    });

    await this.audit.log(null, 'donation.checkout_created', 'Donation', donation.id, {
      amount,
      tipAmount,
      fundraiserId,
    });

    return {
      donationId: donation.id,
      sessionId: checkoutSession.sessionId,
      url: checkoutSession.url,
    };
  }

  /**
   * List completed donations for a fundraiser (public).
   */
  async findByFundraiser(fundraiserId: string, page: number = 1, pageSize: number = 20) {
    // Verify fundraiser exists
    const fundraiser = await this.prisma.fundraiser.findUnique({
      where: { id: fundraiserId },
    });

    if (!fundraiser) {
      throw new NotFoundException('Cagnotte non trouvee');
    }

    const skip = (page - 1) * pageSize;

    const [donations, total] = await Promise.all([
      this.prisma.donation.findMany({
        where: {
          fundraiserId,
          status: DonationStatus.COMPLETED,
        },
        skip,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          amount: true,
          currency: true,
          donorName: true,
          donorMessage: true,
          isAnonymous: true,
          createdAt: true,
        },
      }),
      this.prisma.donation.count({
        where: {
          fundraiserId,
          status: DonationStatus.COMPLETED,
        },
      }),
    ]);

    // Mask donor name for anonymous donations
    const maskedDonations = donations.map((d) => ({
      ...d,
      donorName: d.isAnonymous ? 'Anonyme' : d.donorName,
    }));

    return {
      data: maskedDonations,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  }
}
