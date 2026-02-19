import {
  Controller,
  Post,
  Get,
  Patch,
  Param,
  Body,
  UseGuards,
} from '@nestjs/common';
import { OrganizationsService } from './organizations.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Controller('organizations')
@UseGuards(JwtAuthGuard)
export class OrganizationsController {
  constructor(private readonly organizationsService: OrganizationsService) {}

  @Post()
  async create(@CurrentUser('id') userId: string, @Body() body: unknown) {
    const org = await this.organizationsService.create(userId, body);
    return {
      data: org,
      message: 'Organisation creee avec succes',
    };
  }

  @Get('mine')
  async findMine(@CurrentUser('id') userId: string) {
    const org = await this.organizationsService.findByUser(userId);
    return {
      data: org,
    };
  }

  @Get(':id')
  async findById(@Param('id') id: string) {
    const org = await this.organizationsService.findById(id);
    return {
      data: org,
    };
  }

  @Patch(':id')
  async update(
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
    @Body() body: unknown,
  ) {
    const org = await this.organizationsService.update(userId, id, body);
    return {
      data: org,
      message: 'Organisation mise a jour',
    };
  }

  @Post(':id/attestation')
  async setTaxEligibility(
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
    @Body() body: { isTaxEligible: boolean; taxAttestationUrl?: string },
  ) {
    const org = await this.organizationsService.setTaxEligibility(userId, id, body);
    return {
      data: org,
      message: 'Eligibilite fiscale mise a jour',
    };
  }

  @Post(':id/onboard')
  async startOnboarding(
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
  ) {
    const result = await this.organizationsService.startOnboarding(userId, id);
    return {
      data: result,
      message: 'Onboarding Stripe Connect initie',
    };
  }
}
