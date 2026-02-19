import { Module } from '@nestjs/common';
import { OrganizationsController } from './organizations.controller';
import { OrganizationsService } from './organizations.service';
import { StripeModule } from '../stripe/stripe.module';
import { AuditModule } from '../audit/audit.module';

@Module({
  imports: [StripeModule, AuditModule],
  controllers: [OrganizationsController],
  providers: [OrganizationsService],
  exports: [OrganizationsService],
})
export class OrganizationsModule {}
