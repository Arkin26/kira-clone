/** Default Devnet placeholder — override with NEXT_PUBLIC_MERCHANT_WALLET. */
export const DEFAULT_MERCHANT_WALLET =
  "5CqEX4Z25vtDHfDso4kxxjdYzCrvH8u1cWaHo8UZ5usR";

export const MERCHANT_ID =
  process.env.NEXT_PUBLIC_MERCHANT_ID ?? "k-intent-demo";

export const MERCHANT_WALLET =
  process.env.NEXT_PUBLIC_MERCHANT_WALLET ?? DEFAULT_MERCHANT_WALLET;

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000";

/** Solana cluster for explorer links (default Devnet). */
export const SOLANA_CLUSTER =
  process.env.NEXT_PUBLIC_SOLANA_CLUSTER ?? "devnet";

export function solscanTxUrl(signature: string): string {
  const q =
    SOLANA_CLUSTER === "mainnet-beta" || SOLANA_CLUSTER === "mainnet"
      ? ""
      : `?cluster=${SOLANA_CLUSTER}`;
  return `https://solscan.io/tx/${encodeURIComponent(signature)}${q}`;
}
