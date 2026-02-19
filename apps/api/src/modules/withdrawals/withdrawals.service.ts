import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { StripeService } from '../stripe/stripe.service';
import { AuditService } from '../audit/audit.service';
import { getPlanByCode } from '@kooki/shared';
import { WithdrawalStatus, DonationStatus } from '@prisma/client';

@Injectable()
export class WithdrawalsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly stripe: StripeService,
    private readonly audit: AuditService,
  ) {}

  /**
   * Request a withdrawal for a fundraiser.
   * Validates:
   * - User owns the fundraiser
   * - Connected account is set up and verified
   * - Withdrawal delay rules (J+14 for FREE personal plans)
   * - Sufficient available balance
   */
  async requestWithdrawal(userId: string, body: { fundraiserId: string; amount: number }) {
    const { fundraiserId, amount } = body;

    if (!fundraiserId || !amount || amount <= 0) {
      throw new BadRequestException('fundraiserId et amount (> 0) sont requis');
    }

    // Find fundraiser with organization
    const fundraiser = await this.prisma.fundraiser.findUnique({
      where: { id: fundraiserId },
      include: {
        organization: true,
        owner: true,
      },
    });

    if (!fundraiser) {
      throw new NotFoundException('Cagnotte non trouvee');
    }

    if (fundraiser.ownerUserId !== userId) {
      throw new ForbiddenException("Vous n'etes pas le proprietaire de cette cagnotte");
    }

    // Check connected account (need a Stripe account to receive transfers)
    let connectedAccountId: string | undefined;

    if (fundraiser.type === 'ASSOCIATION') {
      if (!fundraiser.organization?.stripeAccountId) {
        throw new BadRequestException('Votre organisation doit completer l\'onboarding Stripe Connect');
      }
      if (!fundraiser.organization.isOnboarded) {
        throw new BadRequestException('L\'onboarding Stripe Connect n\'est pas termine');
      }
      connectedAccountId = fundraiser.organization.stripeAccountId;
    } else {
      // For PERSONAL, we need a connected account too
      // Check if user has a connected account via their organization (or separate Connect setup)
      const org = await this.prisma.organization.findFirst({
        where: { ownerUserId: userId },
      });
      if (!org?.stripeAccountId || !org.isOnboarded) {
        throw new BadRequestException('Vous devez completer l\'onboarding Stripe Connect pour recevoir vos fonds');
      }
      connectedAccountId = org.stripeAccountId;
    }

    // Check withdrawal delay for FREE personal plans
    const plan = getPlanByCode(fundraiser.planCode);
    if (plan && plan.withdrawDelayDays > 0) {
      // Find the most recent completed donation
      const oldestEligible = await this.prisma.donation.findFirst({
        where: {
          fundraiserId,
          status: DonationStatus.COMPLETED,
        },
        orderBy: { createdAt: 'asc' },
      });

      if (oldestEligible) {
        const delayMs = plan.withdrawDelayDays * 24 * 60 * 60 * 1000;
        const eligibleDate = new Date(oldestEligible.createdAt.getTime() + delayMs);

        if (new Date() < eligibleDate) {
          const daysRemaining = Math.ceil(
            (eligibleDate.getTime() - Date.now()) / (24 * 60 * 60 * 1000),
          );
          throw new BadRequestException(
            `Retrait disponible dans ${daysRemaining} jour(s). Delai de ${plan.withdrawDelayDays} jours pour le plan gratuit.`,
          );
        }
      }
    }

    // Calculate available balance
    const completedDonationsSum = await this.prisma.donation.aggregate({
      where: {
        fundraiserId,
        status: DonationStatus.COMPLETED,
      },
      _sum: { amount: true },
    });

    const completedWithdrawalsSum = await this.prisma.withdrawal.aggregate({
      where: {
        fundraiserId,
        status: {
          in: [WithdrawalStatus.COMPLETED, WithdrawalStatus.PROCESSING, WithdrawalStatus.PENDING],
        },
      },
      _sum: { amount: true },
    });

    const totalDonations = completedDonationsSum._sum.amount || 0;
    const totalWithdrawals = completedWithdrawalsSum._sum.amount || 0;
    const availableBalance = totalDonations - totalWithdrawals;

    if (amount > availableBalance) {
      throw new BadRequestException(
        `Solde disponible insuffisant. Disponible: ${availableBalance} centimes, Demande: ${amount} centimes`,
      );
    }

    // Create withdrawal record
    const withdrawal = await this.prisma.withdrawal.create({
      data: {
        fundraiserId,
        amount,
        status: WithdrawalStatus.PENDING,
      },
    });

    // Initiate Stripe transfer
    try {
      const transfer = await this.stripe.createTransfer({
        amount,
        currency: fundraiser.currency,
        destinationAccountId: connectedAccountId!,
        transferGroup: `fundraiser_${fundraiserId}`,
        metadata: {
          withdrawal_id: withdrawal.id,
          fundraiser_id: fundraiserId,
        },
      });

      await this.prisma.withdrawal.update({
        where: { id: withdrawal.id },
        data: {
          status: WithdrawalStatus.PROCESSING,
          stripeTransferId: transfer.id,
        },
      });

      await this.audit.log(userId, 'withdrawal.initiated', 'Withdrawal', withdrawal.id, {
        amount,
        fundraiserId,
        stripeTransferId: transfer.id,
      });

      return {
        ...withdrawal,
        status: WithdrawalStatus.PROCESSING,
        stripeTransferId: transfer.id,
      };
    } catch (error: any) {
      // Mark withdrawal as failed if Stripe transfer fails
      await this.prisma.withdrawal.update({
        where: { id: withdrawal.id },
        data: { status: WithdrawalStatus.FAILED },
      });

      await this.audit.log(userId, 'withdrawal.failed', 'Withdrawal', withdrawal.id, {
        error: error.message,
      });

      throw new BadRequestException(`Erreur lors du transfert: ${error.message}`);
    }
  }

  /**
   * List withdrawals for the authenticated user's fundraisers.
   */
  async findByUser(userId: string, page: number = 1, pageSize: number = 20) {
    const skip = (page - 1) * pageSize;

    // Find all fundraisers owned by the user
    const fundraiserIds = await this.prisma.fundraiser.findMany({
      where: { ownerUserId: userId },
      select: { id: true },
    });

    const ids = fundraiserIds.map((f) => f.id);

    const [withdrawals, total] = await Promise.all([
      this.prisma.withdrawal.findMany({
        where: { fundraiserId: { in: ids } },
        skip,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
        include: {
          fundraiser: {
            select: {
              id: true,
              title: true,
              slug: true,
            },
          },
        },
      }),
      this.prisma.withdrawal.count({
        where: { fundraiserId: { in: ids } },
      }),
    ]);

    return {
      data: withdrawals,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  }
}
