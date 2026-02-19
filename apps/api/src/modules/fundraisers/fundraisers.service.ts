import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import {
  createFundraiserSchema,
  updateFundraiserSchema,
  getPlanByCode,
  uniqueSlug,
} from '@kooki/shared';
import { FundraiserStatus } from '@prisma/client';

@Injectable()
export class FundraisersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
  ) {}

  async create(userId: string, body: unknown) {
    const parsed = createFundraiserSchema.safeParse(body);
    if (!parsed.success) {
      throw new BadRequestException(parsed.error.errors.map((e) => e.message).join(', '));
    }

    const { title, description, type, organizationId, planCode, coverImageUrl } = parsed.data;

    // Validate plan code
    const plan = getPlanByCode(planCode);
    if (!plan) {
      throw new BadRequestException(`Plan inconnu: ${planCode}`);
    }

    // Validate organization if ASSOCIATION type
    if (type === 'ASSOCIATION') {
      if (!organizationId) {
        throw new BadRequestException('Une organisation est requise pour une collecte associative');
      }
      const org = await this.prisma.organization.findUnique({
        where: { id: organizationId },
      });
      if (!org) {
        throw new NotFoundException('Organisation non trouvee');
      }
      if (org.ownerUserId !== userId) {
        throw new ForbiddenException("Vous n'etes pas le proprietaire de cette organisation");
      }
    }

    // Generate unique slug
    let slug = uniqueSlug(title);

    // Ensure slug is unique (retry up to 5 times)
    let attempts = 0;
    while (attempts < 5) {
      const existing = await this.prisma.fundraiser.findUnique({ where: { slug } });
      if (!existing) break;
      slug = uniqueSlug(title);
      attempts++;
    }

    // Determine max amount from plan (handle Infinity -> use a very large number)
    const maxAmount = plan.ceiling === Infinity ? 999_999_999_99 : plan.ceiling;

    // Determine initial status: free plans go directly to ACTIVE, paid plans stay DRAFT until paid
    const isPaid = plan.price > 0;
    const status = isPaid ? FundraiserStatus.DRAFT : FundraiserStatus.ACTIVE;
    const openingFeePaid = !isPaid;

    const fundraiser = await this.prisma.fundraiser.create({
      data: {
        type,
        ownerUserId: userId,
        organizationId: type === 'ASSOCIATION' ? organizationId : null,
        title,
        description,
        slug,
        planCode,
        maxAmount,
        status,
        openingFeePaid,
        coverImageUrl,
      },
      include: {
        owner: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            role: true,
          },
        },
        organization: true,
      },
    });

    await this.audit.log(userId, 'fundraiser.created', 'Fundraiser', fundraiser.id, {
      title,
      planCode,
      type,
    });

    return fundraiser;
  }

  async findActive(page: number = 1, pageSize: number = 20) {
    const skip = (page - 1) * pageSize;

    const [fundraisers, total] = await Promise.all([
      this.prisma.fundraiser.findMany({
        where: { status: FundraiserStatus.ACTIVE },
        skip,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
        include: {
          owner: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
            },
          },
          _count: {
            select: { donations: { where: { status: 'COMPLETED' } } },
          },
        },
      }),
      this.prisma.fundraiser.count({
        where: { status: FundraiserStatus.ACTIVE },
      }),
    ]);

    return {
      data: fundraisers.map((f) => ({
        ...f,
        donationCount: f._count.donations,
        _count: undefined,
      })),
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  }

  async findMine(userId: string, page: number = 1, pageSize: number = 20) {
    const skip = (page - 1) * pageSize;

    const [fundraisers, total] = await Promise.all([
      this.prisma.fundraiser.findMany({
        where: { ownerUserId: userId },
        skip,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
        include: {
          organization: true,
          _count: {
            select: { donations: { where: { status: 'COMPLETED' } } },
          },
        },
      }),
      this.prisma.fundraiser.count({
        where: { ownerUserId: userId },
      }),
    ]);

    return {
      data: fundraisers.map((f) => ({
        ...f,
        donationCount: f._count.donations,
        _count: undefined,
      })),
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  }

  async findBySlug(slug: string) {
    const fundraiser = await this.prisma.fundraiser.findUnique({
      where: { slug },
      include: {
        owner: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatarUrl: true,
          },
        },
        organization: {
          select: {
            id: true,
            legalName: true,
            isTaxEligible: true,
          },
        },
        _count: {
          select: { donations: { where: { status: 'COMPLETED' } } },
        },
      },
    });

    if (!fundraiser) {
      throw new NotFoundException('Cagnotte non trouvee');
    }

    return {
      ...fundraiser,
      donationCount: fundraiser._count.donations,
      _count: undefined,
    };
  }

  async findById(id: string) {
    const fundraiser = await this.prisma.fundraiser.findUnique({
      where: { id },
      include: {
        owner: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        organization: true,
      },
    });

    if (!fundraiser) {
      throw new NotFoundException('Cagnotte non trouvee');
    }

    return fundraiser;
  }

  async update(userId: string, fundraiserId: string, body: unknown) {
    const fundraiser = await this.findById(fundraiserId);

    if (fundraiser.ownerUserId !== userId) {
      throw new ForbiddenException("Vous n'etes pas le proprietaire de cette cagnotte");
    }

    const parsed = updateFundraiserSchema.safeParse(body);
    if (!parsed.success) {
      throw new BadRequestException(parsed.error.errors.map((e) => e.message).join(', '));
    }

    const { title, description, coverImageUrl } = parsed.data;

    const updated = await this.prisma.fundraiser.update({
      where: { id: fundraiserId },
      data: {
        ...(title !== undefined && { title }),
        ...(description !== undefined && { description }),
        ...(coverImageUrl !== undefined && { coverImageUrl }),
      },
      include: {
        owner: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        organization: true,
      },
    });

    await this.audit.log(userId, 'fundraiser.updated', 'Fundraiser', fundraiserId, parsed.data);

    return updated;
  }

  async pause(userId: string, fundraiserId: string) {
    const fundraiser = await this.findById(fundraiserId);

    if (fundraiser.ownerUserId !== userId) {
      throw new ForbiddenException("Vous n'etes pas le proprietaire de cette cagnotte");
    }

    if (fundraiser.status !== FundraiserStatus.ACTIVE) {
      throw new BadRequestException('Seule une cagnotte active peut etre mise en pause');
    }

    const updated = await this.prisma.fundraiser.update({
      where: { id: fundraiserId },
      data: { status: FundraiserStatus.PAUSED },
    });

    await this.audit.log(userId, 'fundraiser.paused', 'Fundraiser', fundraiserId);

    return updated;
  }

  async resume(userId: string, fundraiserId: string) {
    const fundraiser = await this.findById(fundraiserId);

    if (fundraiser.ownerUserId !== userId) {
      throw new ForbiddenException("Vous n'etes pas le proprietaire de cette cagnotte");
    }

    if (fundraiser.status !== FundraiserStatus.PAUSED) {
      throw new BadRequestException('Seule une cagnotte en pause peut etre reprise');
    }

    const updated = await this.prisma.fundraiser.update({
      where: { id: fundraiserId },
      data: { status: FundraiserStatus.ACTIVE },
    });

    await this.audit.log(userId, 'fundraiser.resumed', 'Fundraiser', fundraiserId);

    return updated;
  }

  async close(userId: string, fundraiserId: string) {
    const fundraiser = await this.findById(fundraiserId);

    if (fundraiser.ownerUserId !== userId) {
      throw new ForbiddenException("Vous n'etes pas le proprietaire de cette cagnotte");
    }

    if (fundraiser.status !== FundraiserStatus.ACTIVE && fundraiser.status !== FundraiserStatus.PAUSED) {
      throw new BadRequestException('Cette cagnotte ne peut pas etre fermee dans son etat actuel');
    }

    const updated = await this.prisma.fundraiser.update({
      where: { id: fundraiserId },
      data: { status: FundraiserStatus.CLOSED },
    });

    await this.audit.log(userId, 'fundraiser.closed', 'Fundraiser', fundraiserId);

    return updated;
  }
}
