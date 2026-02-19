import { Controller, Get, Post, Param, UseGuards } from '@nestjs/common';
import { PlansService } from './plans.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Controller('plans')
export class PlansController {
  constructor(private readonly plansService: PlansService) {}

  /**
   * List all available plans (public endpoint).
   */
  @Get()
  getAll() {
    return {
      data: this.plansService.getAll(),
    };
  }

  /**
   * Create a Stripe Checkout session for paying a plan's opening fee.
   */
  @Post('fundraisers/:id/plan-checkout')
  @UseGuards(JwtAuthGuard)
  async createPlanCheckout(
    @CurrentUser('id') userId: string,
    @CurrentUser('email') userEmail: string,
    @Param('id') fundraiserId: string,
  ) {
    const result = await this.plansService.createPlanCheckout(userId, userEmail, fundraiserId);
    return {
      data: result,
      message: 'Session de paiement plan creee',
    };
  }
}
