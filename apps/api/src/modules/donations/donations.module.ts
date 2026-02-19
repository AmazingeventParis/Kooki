import { Module } from '@nestjs/common';
import { DonationsController } from './donations.controller';
import { DonationsService } from './donations.service';
import { StripeModule } from '../stripe/stripe.module';
import { AuditModule } from '../audit/audit.module';

@Module({
  imports: [StripeModule, AuditModule],
  controllers: [DonationsController],
  providers: [DonationsService],
  exports: [DonationsService],
})
export class DonationsModule {}
