import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { StripeService } from '../stripe/stripe.service';
import { AuditService } from '../audit/audit.service';
import { PERSONAL_PLANS, ASSOCIATION_PLANS, getPlanByCode } from '@kooki/shared';

@Injectable()
export class PlansService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly stripe: StripeService,
    private readonly audit: AuditService,
  ) {}

  /**
   * List all available plans grouped by type.
   */
  getAll() {
    return {
      personal: Object.values(PERSONAL_PLANS).map((plan) => ({
        ...plan,
        ceiling: plan.ceiling === Infinity ? null : plan.ceiling,
      })),
      association: Object.values(ASSOCIATION_PLANS).map((plan) => ({
        ...plan,
        ceiling: plan.ceiling === Infinity ? null : plan.ceiling,
        price: plan.price === -1 ? null : plan.price,
      })),
    };
  }

  /**
   * Create a Stripe Checkout session for paying a plan's opening fee.
   */
  async createPlanCheckout(userId: string, userEmail: string, fundraiserId: string) {
    const fundraiser = await this.prisma.fundraiser.findUnique({
      where: { id: fundraiserId },
    });

    if (!fundraiser) {
      throw new NotFoundException('Cagnotte non trouvee');
    }

    if (fundraiser.ownerUserId !== userId) {
      throw new ForbiddenException("Vous n'etes pas le proprietaire de cette cagnotte");
    }

    if (fundraiser.openingFeePaid) {
      throw new BadRequestException("Les frais d'ouverture ont deja ete payes");
    }

    const plan = getPlanByCode(fundraiser.planCode);
    if (!plan) {
      throw new BadRequestException(`Plan inconnu: ${fundraiser.planCode}`);
    }

    if (plan.price <= 0) {
      throw new BadRequestException('Ce plan est gratuit, aucun paiement requis');
    }

    const result = await this.stripe.createPlanCheckout({
      fundraiserId: fundraiser.id,
      planName: plan.name,
      priceInCents: plan.price,
      userId,
      userEmail,
    });

    await this.audit.log(userId, 'plan.checkout_created', 'Fundraiser', fundraiserId, {
      planCode: fundraiser.planCode,
      price: plan.price,
    });

    return result;
  }
}
