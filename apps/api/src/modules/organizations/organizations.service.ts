import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { StripeService } from '../stripe/stripe.service';
import { AuditService } from '../audit/audit.service';
import { createOrganizationSchema } from '@kooki/shared';
import { UserRole } from '@prisma/client';

@Injectable()
export class OrganizationsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly stripe: StripeService,
    private readonly audit: AuditService,
  ) {}

  /**
   * Create a new organization for the authenticated user.
   * Upgrades the user's role to ORG_ADMIN if currently PERSONAL.
   */
  async create(userId: string, body: unknown) {
    const parsed = createOrganizationSchema.safeParse(body);
    if (!parsed.success) {
      throw new BadRequestException(parsed.error.errors.map((e) => e.message).join(', '));
    }

    const { legalName, email, siret, address } = parsed.data;

    // Check if user already has an organization
    const existing = await this.prisma.organization.findFirst({
      where: { ownerUserId: userId },
    });

    if (existing) {
      throw new ConflictException('Vous avez deja une organisation');
    }

    // Create organization
    const org = await this.prisma.organization.create({
      data: {
        ownerUserId: userId,
        legalName,
        email,
        siret,
        address,
      },
    });

    // Upgrade user role to ORG_ADMIN
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (user && user.role === UserRole.PERSONAL) {
      await this.prisma.user.update({
        where: { id: userId },
        data: { role: UserRole.ORG_ADMIN },
      });
    }

    await this.audit.log(userId, 'organization.created', 'Organization', org.id, {
      legalName,
      email,
    });

    return org;
  }

  /**
   * Get the authenticated user's organization.
   */
  async findByUser(userId: string) {
    const org = await this.prisma.organization.findFirst({
      where: { ownerUserId: userId },
      include: {
        fundraisers: {
          select: {
            id: true,
            title: true,
            status: true,
            currentAmount: true,
            maxAmount: true,
          },
        },
      },
    });

    if (!org) {
      throw new NotFoundException('Aucune organisation trouvee');
    }

    return org;
  }

  /**
   * Get an organization by ID.
   */
  async findById(orgId: string) {
    const org = await this.prisma.organization.findUnique({
      where: { id: orgId },
    });

    if (!org) {
      throw new NotFoundException('Organisation non trouvee');
    }

    return org;
  }

  /**
   * Update organization details.
   */
  async update(userId: string, orgId: string, body: unknown) {
    const org = await this.findById(orgId);

    if (org.ownerUserId !== userId) {
      throw new ForbiddenException("Vous n'etes pas le proprietaire de cette organisation");
    }

    const parsed = createOrganizationSchema.partial().safeParse(body);
    if (!parsed.success) {
      throw new BadRequestException(parsed.error.errors.map((e) => e.message).join(', '));
    }

    const updated = await this.prisma.organization.update({
      where: { id: orgId },
      data: parsed.data,
    });

    await this.audit.log(userId, 'organization.updated', 'Organization', orgId, parsed.data);

    return updated;
  }

  /**
   * Mark organization as tax eligible (upload attestation).
   */
  async setTaxEligibility(
    userId: string,
    orgId: string,
    body: { isTaxEligible: boolean; taxAttestationUrl?: string },
  ) {
    const org = await this.findById(orgId);

    if (org.ownerUserId !== userId) {
      throw new ForbiddenException("Vous n'etes pas le proprietaire de cette organisation");
    }

    if (body.isTaxEligible && !body.taxAttestationUrl) {
      throw new BadRequestException("L'URL de l'attestation fiscale est requise pour activer l'eligibilite");
    }

    const updated = await this.prisma.organization.update({
      where: { id: orgId },
      data: {
        isTaxEligible: body.isTaxEligible,
        taxAttestationUrl: body.taxAttestationUrl || null,
      },
    });

    await this.audit.log(userId, 'organization.tax_eligibility_updated', 'Organization', orgId, {
      isTaxEligible: body.isTaxEligible,
    });

    return updated;
  }

  /**
   * Start Stripe Connect onboarding for the organization.
   */
  async startOnboarding(userId: string, orgId: string) {
    const org = await this.findById(orgId);

    if (org.ownerUserId !== userId) {
      throw new ForbiddenException("Vous n'etes pas le proprietaire de cette organisation");
    }

    // Create Stripe Connect account if not already present
    let stripeAccountId = org.stripeAccountId;

    if (!stripeAccountId) {
      stripeAccountId = await this.stripe.createConnectAccount({
        email: org.email,
        businessName: org.legalName,
      });

      await this.prisma.organization.update({
        where: { id: orgId },
        data: { stripeAccountId },
      });
    }

    // Generate account link
    const { url } = await this.stripe.createAccountLink(stripeAccountId);

    await this.audit.log(userId, 'organization.onboarding_started', 'Organization', orgId);

    return { url, stripeAccountId };
  }
}
