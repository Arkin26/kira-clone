import { Module } from '@nestjs/common';
import { ApiKeyGuard } from '../common/guards/api-key.guard';
import { EvmModule } from '../evm/evm.module';
import { SolanaModule } from '../solana/solana.module';
import { WebhooksModule } from '../webhooks/webhooks.module';
import { PaymentsController } from './payments.controller';
import { PaymentsService } from './payments.service';

@Module({
  imports: [SolanaModule, EvmModule, WebhooksModule],
  controllers: [PaymentsController],
  providers: [PaymentsService, ApiKeyGuard],
  exports: [PaymentsService],
})
export class PaymentsModule {}
