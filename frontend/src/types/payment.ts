export type PaymentIntentStatus = "PENDING" | "SUCCESS" | "FAILED";

export type SerializedPaymentIntent = {
  id: string;
  merchantId: string;
  amount: string;
  currency: string;
  status: PaymentIntentStatus;
  signature: string | null;
  createdAt: string;
  updatedAt: string;
};

export type PaymentMetrics = {
  totalVolumeSol: string;
  successCount: number;
  totalCount: number;
};
