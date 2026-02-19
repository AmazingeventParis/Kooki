import {
  Controller,
  Post,
  Get,
  Body,
  Query,
  UseGuards,
} from '@nestjs/common';
import { WithdrawalsService } from './withdrawals.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Controller('withdrawals')
@UseGuards(JwtAuthGuard)
export class WithdrawalsController {
  constructor(private readonly withdrawalsService: WithdrawalsService) {}

  @Post()
  async requestWithdrawal(
    @CurrentUser('id') userId: string,
    @Body() body: { fundraiserId: string; amount: number },
  ) {
    const withdrawal = await this.withdrawalsService.requestWithdrawal(userId, body);
    return {
      data: withdrawal,
      message: 'Demande de retrait enregistree',
    };
  }

  @Get()
  async findMyWithdrawals(
    @CurrentUser('id') userId: string,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
  ) {
    const result = await this.withdrawalsService.findByUser(
      userId,
      page ? parseInt(page, 10) : 1,
      pageSize ? parseInt(pageSize, 10) : 20,
    );
    return result;
  }
}
