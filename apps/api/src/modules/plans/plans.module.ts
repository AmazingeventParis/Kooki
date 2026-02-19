import { Module } from '@nestjs/common';
import { PlansController } from './plans.controller';
import { PlansService } from './plans.service';
import { StripeModule } from '../stripe/stripe.module';
import { AuditModule } from '../audit/audit.module';

@Module({
  imports: [StripeModule, AuditModule],
  controllers: [PlansController],
  providers: [PlansService],
  exports: [PlansService],
})
export class PlansModule {}
