import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class AuditService {
  private readonly logger = new Logger(AuditService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Log an audit event to the audit_logs table.
   *
   * @param actorUserId - The user who performed the action (null for system actions)
   * @param action - The action performed (e.g., "fundraiser.created", "donation.completed")
   * @param entityType - The type of entity affected (e.g., "Fundraiser", "Donation")
   * @param entityId - The ID of the entity affected
   * @param payload - Optional additional data about the action
   */
  async log(
    actorUserId: string | null,
    action: string,
    entityType: string,
    entityId: string,
    payload?: Record<string, any>,
  ): Promise<void> {
    try {
      await this.prisma.auditLog.create({
        data: {
          actorUserId,
          action,
          entityType,
          entityId,
          payloadJson: payload ? JSON.stringify(payload) : null,
        },
      });
    } catch (error: any) {
      // Log but don't throw - audit logging should not break the main flow
      this.logger.error(`Failed to write audit log: ${error.message}`, {
        action,
        entityType,
        entityId,
      });
    }
  }

  /**
   * Query audit logs with optional filters.
   */
  async query(params: {
    actorUserId?: string;
    entityType?: string;
    entityId?: string;
    action?: string;
    page?: number;
    pageSize?: number;
  }) {
    const { actorUserId, entityType, entityId, action, page = 1, pageSize = 50 } = params;
    const skip = (page - 1) * pageSize;

    const where: any = {};
    if (actorUserId) where.actorUserId = actorUserId;
    if (entityType) where.entityType = entityType;
    if (entityId) where.entityId = entityId;
    if (action) where.action = { contains: action };

    const [logs, total] = await Promise.all([
      this.prisma.auditLog.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
        include: {
          actor: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
            },
          },
        },
      }),
      this.prisma.auditLog.count({ where }),
    ]);

    return {
      data: logs,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  }
}
