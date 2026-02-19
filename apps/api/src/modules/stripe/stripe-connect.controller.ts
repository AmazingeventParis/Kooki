import {
  Controller,
  Post,
  Get,
  UseGuards,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { StripeService } from './stripe.service';
import { PrismaService } from '../../prisma/prisma.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { AuditService } from '../audit/audit.service';

@Controller('stripe/connect')
@UseGuards(JwtAuthGuard)
export class StripeConnectController {
  constructor(
    private readonly stripeService: StripeService,
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
  ) {}

  /**
   * Start or resume Stripe Connect onboarding for the user's organization.
   */
  @Post('onboard')
  async onboard(@CurrentUser('id') userId: string) {
    // Find the user's organization
    const org = await this.prisma.organization.findFirst({
      where: { ownerUserId: userId },
    });

    if (!org) {
      throw new NotFoundException('Aucune organisation trouvee pour cet utilisateur');
    }

    // Create Stripe Connect account if not exists
    let stripeAccountId = org.stripeAccountId;

    if (!stripeAccountId) {
      stripeAccountId = await this.stripeService.createConnectAccount({
        email: org.email,
        businessName: org.legalName,
      });

      await this.prisma.organization.update({
        where: { id: org.id },
        data: { stripeAccountId },
      });

      await this.audit.log(userId, 'stripe.connect_account_created', 'Organization', org.id, {
        stripeAccountId,
      });
    }

    // Create account link for onboarding
    const { url } = await this.stripeService.createAccountLink(stripeAccountId);

    return {
      data: { url },
      message: 'Lien d\'onboarding genere',
    };
  }

  /**
   * Get the Connect account status for the user's organization.
   */
  @Get('status')
  async status(@CurrentUser('id') userId: string) {
    const org = await this.prisma.organization.findFirst({
      where: { ownerUserId: userId },
    });

    if (!org) {
      throw new NotFoundException('Aucune organisation trouvee pour cet utilisateur');
    }

    if (!org.stripeAccountId) {
      return {
        data: {
          hasAccount: false,
          chargesEnabled: false,
          payoutsEnabled: false,
          detailsSubmitted: false,
          currentlyDue: [],
          isOnboarded: false,
        },
      };
    }

    const status = await this.stripeService.getAccountStatus(org.stripeAccountId);

    return {
      data: {
        hasAccount: true,
        ...status,
        isOnboarded: org.isOnboarded,
      },
    };
  }
}
