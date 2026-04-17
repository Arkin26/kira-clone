import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';
import { CreatePaymentIntentDto } from './dto/create-payment-intent.dto';
import { VerifyPaymentDto } from './dto/verify-payment.dto';
import type { PaymentMetricsDto } from './payments.types';
import { SerializedPaymentIntent } from './payments.types';
import { PaymentsService } from './payments.service';

@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Get('metrics')
  async getMetrics(): Promise<PaymentMetricsDto> {
    return this.paymentsService.getPaymentMetrics();
  }

  @Get()
  async list(@Query('q') q?: string): Promise<SerializedPaymentIntent[]> {
    return this.paymentsService.listPayments(q);
  }

  @Post('intent')
  async createIntent(@Body() dto: CreatePaymentIntentDto): Promise<SerializedPaymentIntent> {
    const intent = await this.paymentsService.createIntent(dto);
    return this.paymentsService.serializeIntent(intent);
  }

  /** Rate-limited to reduce Solana RPC load from abusive verification retries (5 req / min / IP). */
  @Post('verify')
  @UseGuards(ThrottlerGuard)
  async verifyPayment(@Body() dto: VerifyPaymentDto): Promise<SerializedPaymentIntent> {
    return this.paymentsService.verifyTransaction(dto.signature, dto.intentId);
  }
}
