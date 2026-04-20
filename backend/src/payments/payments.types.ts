import { PaymentIntent } from '@prisma/client';

/** JSON-safe shape for API responses (Prisma `Decimal` as string). */
export type SerializedPaymentIntent = Omit<PaymentIntent, 'amount'> & { amount: string };

/** Aggregates for merchant dashboard. */
export type PaymentMetricsDto = {
  totalVolumeSol: string;
  totalVolumeSpl: string;
  totalVolumeEth: string;
  successCount: number;
  totalCount: number;
};
