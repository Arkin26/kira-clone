import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { EvmSettlementService } from './evm-settlement.service';

@Module({
  imports: [PrismaModule],
  providers: [EvmSettlementService],
  exports: [EvmSettlementService],
})
export class EvmModule {}
