import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { FundraisersModule } from './modules/fundraisers/fundraisers.module';
import { DonationsModule } from './modules/donations/donations.module';
import { StripeModule } from './modules/stripe/stripe.module';
import { WithdrawalsModule } from './modules/withdrawals/withdrawals.module';
import { OrganizationsModule } from './modules/organizations/organizations.module';
import { PlansModule } from './modules/plans/plans.module';
import { AuditModule } from './modules/audit/audit.module';
import { AdminModule } from './modules/admin/admin.module';
import { HealthController } from './health.controller';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
    }),
    PrismaModule,
    AuthModule,
    FundraisersModule,
    DonationsModule,
    StripeModule,
    WithdrawalsModule,
    OrganizationsModule,
    PlansModule,
    AuditModule,
    AdminModule,
  ],
  controllers: [HealthController],
})
export class AppModule {}
