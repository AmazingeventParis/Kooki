import { Module } from '@nestjs/common';
import { WithdrawalsController } from './withdrawals.controller';
import { WithdrawalsService } from './withdrawals.service';
import { StripeModule } from '../stripe/stripe.module';
import { AuditModule } from '../audit/audit.module';

@Module({
  imports: [StripeModule, AuditModule],
  controllers: [WithdrawalsController],
  providers: [WithdrawalsService],
  exports: [WithdrawalsService],
})
export class WithdrawalsModule {}
