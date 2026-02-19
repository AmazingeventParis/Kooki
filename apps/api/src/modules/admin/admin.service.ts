import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import { FundraiserStatus } from '@prisma/client';

@Injectable()
export class AdminService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
  ) {}

  /**
   * List all fundraisers with filters and pagination.
   */
  async listFundraisers(params: {
    page?: number;
    pageSize?: number;
    status?: string;
    search?: string;
  }) {
    const { page = 1, pageSize = 20, status, search } = params;
    const skip = (page - 1) * pageSize;

    const where: any = {};
    if (status) {
      where.status = status;
    }
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { slug: { contains: search, mode: 'insensitive' } },
        { owner: { email: { contains: search, mode: 'insensitive' } } },
      ];
    }

    const [fundraisers, total] = await Promise.all([
      this.prisma.fundraiser.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
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
          organization: {
            select: {
              id: true,
              legalName: true,
            },
          },
          _count: {
            select: {
              donations: true,
              withdrawals: true,
            },
          },
        },
      }),
      this.prisma.fundraiser.count({ where }),
    ]);

    return {
      data: fundraisers.map((f) => ({
        ...f,
        donationCount: f._count.donations,
        withdrawalCount: f._count.withdrawals,
        _count: undefined,
      })),
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  }

  /**
   * List all users with pagination and search.
   */
  async listUsers(params: {
    page?: number;
    pageSize?: number;
    search?: string;
    role?: string;
  }) {
    const { page = 1, pageSize = 20, search, role } = params;
    const skip = (page - 1) * pageSize;

    const where: any = {};
    if (role) {
      where.role = role;
    }
    if (search) {
      where.OR = [
        { email: { contains: search, mode: 'insensitive' } },
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          role: true,
          createdAt: true,
          updatedAt: true,
          _count: {
            select: {
              fundraisers: true,
              organizations: true,
            },
          },
        },
      }),
      this.prisma.user.count({ where }),
    ]);

    return {
      data: users.map((u) => ({
        ...u,
        fundraiserCount: u._count.fundraisers,
        organizationCount: u._count.organizations,
        _count: undefined,
      })),
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  }

  /**
   * List all donations with pagination and filters.
   */
  async listDonations(params: {
    page?: number;
    pageSize?: number;
    status?: string;
    fundraiserId?: string;
  }) {
    const { page = 1, pageSize = 20, status, fundraiserId } = params;
    const skip = (page - 1) * pageSize;

    const where: any = {};
    if (status) {
      where.status = status;
    }
    if (fundraiserId) {
      where.fundraiserId = fundraiserId;
    }

    const [donations, total] = await Promise.all([
      this.prisma.donation.findMany({
        where,
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
          tip: {
            select: {
              amount: true,
            },
          },
          taxReceipt: {
            select: {
              id: true,
              receiptNumber: true,
              status: true,
            },
          },
        },
      }),
      this.prisma.donation.count({ where }),
    ]);

    return {
      data: donations,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  }

  /**
   * Suspend a fundraiser (admin action).
   */
  async suspendFundraiser(adminUserId: string, fundraiserId: string) {
    const fundraiser = await this.prisma.fundraiser.findUnique({
      where: { id: fundraiserId },
    });

    if (!fundraiser) {
      throw new NotFoundException('Cagnotte non trouvee');
    }

    if (fundraiser.status === FundraiserStatus.CLOSED) {
      throw new BadRequestException('Cette cagnotte est deja fermee');
    }

    const updated = await this.prisma.fundraiser.update({
      where: { id: fundraiserId },
      data: { status: FundraiserStatus.CLOSED },
    });

    await this.audit.log(adminUserId, 'admin.fundraiser_suspended', 'Fundraiser', fundraiserId, {
      previousStatus: fundraiser.status,
    });

    return updated;
  }

  /**
   * Get platform-wide statistics.
   */
  async getStats() {
    const [
      totalUsers,
      totalFundraisers,
      activeFundraisers,
      totalDonationsResult,
      completedDonationsSum,
    ] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.fundraiser.count(),
      this.prisma.fundraiser.count({ where: { status: FundraiserStatus.ACTIVE } }),
      this.prisma.donation.count({ where: { status: 'COMPLETED' } }),
      this.prisma.donation.aggregate({
        where: { status: 'COMPLETED' },
        _sum: { amount: true },
      }),
    ]);

    return {
      totalUsers,
      totalFundraisers,
      activeFundraisers,
      totalDonations: totalDonationsResult,
      totalDonationAmount: completedDonationsSum._sum.amount || 0,
    };
  }

  /**
   * Query audit logs (admin only).
   */
  async getAuditLogs(params: {
    page?: number;
    pageSize?: number;
    action?: string;
    entityType?: string;
  }) {
    return this.audit.query(params);
  }
}
