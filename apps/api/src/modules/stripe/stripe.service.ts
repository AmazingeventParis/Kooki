import { Injectable, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class StripeService {
  private stripe: Stripe;

  constructor(
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
  ) {
    const secretKey = this.configService.get<string>('STRIPE_SECRET_KEY');
    if (!secretKey) {
      console.warn('STRIPE_SECRET_KEY not set - Stripe operations will fail');
    }
    this.stripe = new Stripe(secretKey || '', {
      apiVersion: '2024-12-18.acacia' as Stripe.LatestApiVersion,
    });
  }

  /**
   * Create a donation checkout session.
   * - PERSONAL fundraisers: Separate Charges & Transfers (payment to platform, transfer later)
   * - ASSOCIATION fundraisers: Direct Charges (payment on connected account, application fee = tip)
   */
  async createDonationCheckout(params: {
    donationId: string;
    fundraiserId: string;
    fundraiserSlug: string;
    fundraiserType: string;
    amount: number;
    tipAmount: number;
    currency: string;
    donorEmail: string;
    donorName: string;
    connectedAccountId?: string;
  }): Promise<{ sessionId: string; url: string }> {
    const appUrl = this.configService.get<string>('NEXT_PUBLIC_APP_URL', 'http://localhost:3000');
    const totalAmount = params.amount + params.tipAmount;

    try {
      if (params.fundraiserType === 'ASSOCIATION' && params.connectedAccountId) {
        // Direct Charges on the connected account
        // The tip becomes the application_fee_amount
        const session = await this.stripe.checkout.sessions.create(
          {
            mode: 'payment',
            customer_email: params.donorEmail,
            line_items: [
              {
                price_data: {
                  currency: params.currency.toLowerCase(),
                  product_data: {
                    name: `Don - ${params.donorName}`,
                  },
                  unit_amount: totalAmount,
                },
                quantity: 1,
              },
            ],
            payment_intent_data: {
              application_fee_amount: params.tipAmount,
              metadata: {
                donation_id: params.donationId,
                fundraiser_id: params.fundraiserId,
                type: 'donation',
                tip_amount: params.tipAmount.toString(),
              },
            },
            metadata: {
              donation_id: params.donationId,
              fundraiser_id: params.fundraiserId,
              type: 'donation',
            },
            success_url: `${appUrl}/c/${params.fundraiserSlug}?merci=true&session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${appUrl}/c/${params.fundraiserSlug}`,
          },
          {
            stripeAccount: params.connectedAccountId,
          },
        );

        return {
          sessionId: session.id,
          url: session.url || '',
        };
      } else {
        // Separate Charges & Transfers (PERSONAL fundraisers)
        // Payment goes to platform account
        const session = await this.stripe.checkout.sessions.create({
          mode: 'payment',
          customer_email: params.donorEmail,
          line_items: [
            {
              price_data: {
                currency: params.currency.toLowerCase(),
                product_data: {
                  name: `Don - ${params.donorName}`,
                },
                unit_amount: totalAmount,
              },
              quantity: 1,
            },
          ],
          payment_intent_data: {
            metadata: {
              donation_id: params.donationId,
              fundraiser_id: params.fundraiserId,
              type: 'donation',
              tip_amount: params.tipAmount.toString(),
              donation_amount: params.amount.toString(),
            },
          },
          metadata: {
            donation_id: params.donationId,
            fundraiser_id: params.fundraiserId,
            type: 'donation',
          },
          success_url: `${appUrl}/c/${params.fundraiserId}/merci?session_id={CHECKOUT_SESSION_ID}`,
          cancel_url: `${appUrl}/c/${params.fundraiserId}`,
        });

        return {
          sessionId: session.id,
          url: session.url || '',
        };
      }
    } catch (error: any) {
      throw new InternalServerErrorException(`Erreur Stripe: ${error.message}`);
    }
  }

  /**
   * Create a plan payment checkout session for paid plans.
   */
  async createPlanCheckout(params: {
    fundraiserId: string;
    planName: string;
    priceInCents: number;
    userId: string;
    userEmail: string;
  }): Promise<{ sessionId: string; url: string }> {
    const appUrl = this.configService.get<string>('NEXT_PUBLIC_APP_URL', 'http://localhost:3000');

    try {
      const session = await this.stripe.checkout.sessions.create({
        mode: 'payment',
        customer_email: params.userEmail,
        line_items: [
          {
            price_data: {
              currency: 'eur',
              product_data: {
                name: `Plan ${params.planName} - Kooki`,
                description: 'Frais d\'ouverture de cagnotte',
              },
              unit_amount: params.priceInCents,
            },
            quantity: 1,
          },
        ],
        metadata: {
          type: 'plan',
          fundraiser_id: params.fundraiserId,
          user_id: params.userId,
        },
        success_url: `${appUrl}/dashboard/cagnottes/${params.fundraiserId}?plan_paid=true`,
        cancel_url: `${appUrl}/dashboard/cagnottes/${params.fundraiserId}?plan_cancelled=true`,
      });

      return {
        sessionId: session.id,
        url: session.url || '',
      };
    } catch (error: any) {
      throw new InternalServerErrorException(`Erreur Stripe: ${error.message}`);
    }
  }

  /**
   * Create a Stripe Connect account link for onboarding.
   */
  async createAccountLink(stripeAccountId: string): Promise<{ url: string }> {
    const appUrl = this.configService.get<string>('NEXT_PUBLIC_APP_URL', 'http://localhost:3000');

    try {
      const accountLink = await this.stripe.accountLinks.create({
        account: stripeAccountId,
        refresh_url: `${appUrl}/dashboard/organisation/onboarding?refresh=true`,
        return_url: `${appUrl}/dashboard/organisation/onboarding?success=true`,
        type: 'account_onboarding',
      });

      return { url: accountLink.url };
    } catch (error: any) {
      throw new InternalServerErrorException(`Erreur Stripe Connect: ${error.message}`);
    }
  }

  /**
   * Create a Stripe Connect Express account for an organization.
   */
  async createConnectAccount(params: {
    email: string;
    businessName: string;
    country?: string;
  }): Promise<string> {
    try {
      const account = await this.stripe.accounts.create({
        type: 'express',
        country: params.country || 'FR',
        email: params.email,
        business_profile: {
          name: params.businessName,
        },
        capabilities: {
          card_payments: { requested: true },
          transfers: { requested: true },
        },
      });

      return account.id;
    } catch (error: any) {
      throw new InternalServerErrorException(`Erreur creation compte Connect: ${error.message}`);
    }
  }

  /**
   * Get the status of a Stripe Connect account.
   */
  async getAccountStatus(stripeAccountId: string): Promise<{
    chargesEnabled: boolean;
    payoutsEnabled: boolean;
    detailsSubmitted: boolean;
    currentlyDue: string[];
  }> {
    try {
      const account = await this.stripe.accounts.retrieve(stripeAccountId);

      return {
        chargesEnabled: account.charges_enabled || false,
        payoutsEnabled: account.payouts_enabled || false,
        detailsSubmitted: account.details_submitted || false,
        currentlyDue: (account.requirements?.currently_due as string[]) || [],
      };
    } catch (error: any) {
      throw new InternalServerErrorException(`Erreur statut Connect: ${error.message}`);
    }
  }

  /**
   * Create a transfer to a connected account (for PERSONAL fundraiser withdrawals).
   */
  async createTransfer(params: {
    amount: number;
    currency: string;
    destinationAccountId: string;
    transferGroup?: string;
    metadata?: Record<string, string>;
  }): Promise<Stripe.Transfer> {
    try {
      const transfer = await this.stripe.transfers.create({
        amount: params.amount,
        currency: params.currency.toLowerCase(),
        destination: params.destinationAccountId,
        transfer_group: params.transferGroup,
        metadata: params.metadata,
      });

      return transfer;
    } catch (error: any) {
      throw new InternalServerErrorException(`Erreur transfert: ${error.message}`);
    }
  }

  /**
   * Construct and verify a webhook event.
   */
  constructWebhookEvent(payload: Buffer, signature: string): Stripe.Event {
    const webhookSecret = this.configService.get<string>('STRIPE_WEBHOOK_SECRET');
    if (!webhookSecret) {
      throw new BadRequestException('Webhook secret non configure');
    }

    try {
      return this.stripe.webhooks.constructEvent(payload, signature, webhookSecret);
    } catch (error: any) {
      throw new BadRequestException(`Signature webhook invalide: ${error.message}`);
    }
  }

  /**
   * Retrieve a Checkout Session with line items.
   */
  async retrieveCheckoutSession(sessionId: string): Promise<Stripe.Checkout.Session> {
    return this.stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['payment_intent', 'line_items'],
    });
  }
}
