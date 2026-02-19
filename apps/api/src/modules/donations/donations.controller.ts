import {
  Controller,
  Post,
  Get,
  Param,
  Body,
  Query,
} from '@nestjs/common';
import { DonationsService } from './donations.service';

@Controller()
export class DonationsController {
  constructor(private readonly donationsService: DonationsService) {}

  /**
   * Create a donation checkout session. Public endpoint (no auth needed for donors).
   */
  @Post('donations/checkout')
  async createCheckout(@Body() body: unknown) {
    const result = await this.donationsService.createCheckout(body);
    return {
      data: result,
      message: 'Session de paiement creee',
    };
  }

  /**
   * List completed donations for a fundraiser. Public endpoint.
   */
  @Get('fundraisers/:fundraiserId/donations')
  async findByFundraiser(
    @Param('fundraiserId') fundraiserId: string,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
  ) {
    const result = await this.donationsService.findByFundraiser(
      fundraiserId,
      page ? parseInt(page, 10) : 1,
      pageSize ? parseInt(pageSize, 10) : 20,
    );
    return result;
  }
}
