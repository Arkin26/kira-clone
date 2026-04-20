export type PaymentIntentStatus = "PENDING" | "SUCCESS" | "FAILED";

export type AssetKind = "NATIVE_SOL" | "SPL_TOKEN" | "EVM_NATIVE" | "EVM_ERC20";

export type SerializedPaymentIntent = {
  id: string;
  merchantId: string;
  amount: string;
  currency: string;
  status: PaymentIntentStatus;
  signature: string | null;
  chainId: string;
  assetKind: AssetKind;
  mintAddress: string | null;
  treasuryAddress: string;
  payerAddress?: string | null;
  evmChainId: number | null;
  createdAt: string;
  updatedAt: string;
};

export type PaymentMetrics = {
  totalVolumeSol: string;
  totalVolumeSpl: string;
  totalVolumeEth: string;
  successCount: number;
  totalCount: number;
};
