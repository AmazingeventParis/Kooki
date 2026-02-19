import { Module } from '@nestjs/common';
import { FundraisersController } from './fundraisers.controller';
import { FundraisersService } from './fundraisers.service';
import { AuditModule } from '../audit/audit.module';

@Module({
  imports: [AuditModule],
  controllers: [FundraisersController],
  providers: [FundraisersService],
  exports: [FundraisersService],
})
export class FundraisersModule {}
