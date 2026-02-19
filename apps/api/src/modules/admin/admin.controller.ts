import {
  Controller,
  Get,
  Post,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  /**
   * Get platform statistics.
   */
  @Get('stats')
  async getStats() {
    const stats = await this.adminService.getStats();
    return { data: stats };
  }

  /**
   * List all fundraisers (admin only).
   */
  @Get('fundraisers')
  async listFundraisers(
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
    @Query('status') status?: string,
    @Query('search') search?: string,
  ) {
    return this.adminService.listFundraisers({
      page: page ? parseInt(page, 10) : 1,
      pageSize: pageSize ? parseInt(pageSize, 10) : 20,
      status,
      search,
    });
  }

  /**
   * List all users (admin only).
   */
  @Get('users')
  async listUsers(
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
    @Query('search') search?: string,
    @Query('role') role?: string,
  ) {
    return this.adminService.listUsers({
      page: page ? parseInt(page, 10) : 1,
      pageSize: pageSize ? parseInt(pageSize, 10) : 20,
      search,
      role,
    });
  }

  /**
   * List all donations (admin only).
   */
  @Get('donations')
  async listDonations(
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
    @Query('status') status?: string,
    @Query('fundraiserId') fundraiserId?: string,
  ) {
    return this.adminService.listDonations({
      page: page ? parseInt(page, 10) : 1,
      pageSize: pageSize ? parseInt(pageSize, 10) : 20,
      status,
      fundraiserId,
    });
  }

  /**
   * Suspend a fundraiser (admin only).
   */
  @Post('fundraisers/:id/suspend')
  async suspendFundraiser(
    @CurrentUser('id') adminUserId: string,
    @Param('id') fundraiserId: string,
  ) {
    const fundraiser = await this.adminService.suspendFundraiser(adminUserId, fundraiserId);
    return {
      data: fundraiser,
      message: 'Cagnotte suspendue par un administrateur',
    };
  }

  /**
   * Get audit logs (admin only).
   */
  @Get('audit-logs')
  async getAuditLogs(
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
    @Query('action') action?: string,
    @Query('entityType') entityType?: string,
  ) {
    return this.adminService.getAuditLogs({
      page: page ? parseInt(page, 10) : 1,
      pageSize: pageSize ? parseInt(pageSize, 10) : 50,
      action,
      entityType,
    });
  }
}
