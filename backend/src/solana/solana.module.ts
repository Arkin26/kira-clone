import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { SolanaSettlementService } from './solana-settlement.service';

@Module({
  imports: [PrismaModule],
  providers: [SolanaSettlementService],
  exports: [SolanaSettlementService],
})
export class SolanaModule {}
