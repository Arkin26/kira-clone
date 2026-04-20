import { createHmac } from 'crypto';

import { Injectable, Logger } from '@nestjs/common';
import { PaymentIntent } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import type { SerializedPaymentIntent } from '../payments/payments.types';

/**
 * Delivers HMAC-signed webhook notifications to merchants configured on {@link Merchant}.
 * Failures are logged; callers are not blocked by network latency (fire-and-forget).
 */
@Injectable()
export class WebhooksService {
  private readonly logger = new Logger(WebhooksService.name);

  constructor(private readonly prisma: PrismaService) {}

  notifyIntentUpdated(intent: PaymentIntent, serialized: SerializedPaymentIntent): void {
    void this.deliver(intent, serialized);
  }

  private async deliver(intent: PaymentIntent, serialized: SerializedPaymentIntent): Promise<void> {
    const merchant = await this.prisma.merchant.findUnique({
      where: { id: intent.merchantId },
    });
    if (!merchant?.webhookUrl?.trim() || !merchant.webhookSecret?.trim()) {
      return;
    }

    const bodyObj = {
      event: 'payment_intent.updated',
      id: intent.id,
      status: intent.status,
      data: serialized,
    };
    const body = JSON.stringify(bodyObj);
    const signature = createHmac('sha256', merchant.webhookSecret).update(body).digest('hex');

    try {
      const res = await fetch(merchant.webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-K-Intent-Signature': signature,
          'X-K-Intent-Event': 'payment_intent.updated',
        },
        body,
      });
      if (!res.ok) {
        this.logger.warn(`Webhook ${merchant.webhookUrl} returned ${res.status}`);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      this.logger.warn(`Webhook delivery failed: ${message}`);
    }
  }
}
