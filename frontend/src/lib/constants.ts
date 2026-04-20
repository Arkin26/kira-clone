/** Default Devnet placeholder — override with NEXT_PUBLIC_MERCHANT_WALLET. */
export const DEFAULT_MERCHANT_WALLET =
  "5CqEX4Z25vtDHfDso4kxxjdYzCrvH8u1cWaHo8UZ5usR";

export const MERCHANT_ID =
  process.env.NEXT_PUBLIC_MERCHANT_ID ?? "k-intent-demo";

export const MERCHANT_WALLET =
  process.env.NEXT_PUBLIC_MERCHANT_WALLET ?? DEFAULT_MERCHANT_WALLET;

const NEXT_PUBLIC_API_URL = process.env.NEXT_PUBLIC_API_URL?.trim();

export const API_BASE_URL =
  NEXT_PUBLIC_API_URL && NEXT_PUBLIC_API_URL.length > 0
    ? NEXT_PUBLIC_API_URL.replace(/\/+$/, "")
    : process.env.NODE_ENV !== "production"
      ? "http://localhost:3000"
      : "";

/** Optional: must match backend `API_KEY` when that env is set. */
export const API_KEY = process.env.NEXT_PUBLIC_API_KEY ?? "";

/** Circle devnet USDC mint (allowlisted in seed / `MerchantAssetAllowlist`). */
export const DEVNET_USDC_MINT =
  process.env.NEXT_PUBLIC_DEVNET_USDC_MINT ??
  "4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU";

/** Solana cluster for explorer links (default Devnet). */
export const SOLANA_CLUSTER =
  process.env.NEXT_PUBLIC_SOLANA_CLUSTER ?? "devnet";

/** EIP-155 chain id string for Sepolia (must match backend intents). */
export const EIP155_SEPOLIA = "eip155:11155111";

/** Sepolia ERC-20 USDC (or test token) — must be allowlisted in DB for `MERCHANT_ID`. */
export const SEPOLIA_ERC20_USDC =
  process.env.NEXT_PUBLIC_SEPOLIA_USDC_MINT ?? "";

/** Set in Privy dashboard; required for EVM + embedded wallets in the app shell. */
export const PRIVY_APP_ID = process.env.NEXT_PUBLIC_PRIVY_APP_ID ?? "";

export function solscanTxUrl(signature: string): string {
  const q =
    SOLANA_CLUSTER === "mainnet-beta" || SOLANA_CLUSTER === "mainnet"
      ? ""
      : `?cluster=${SOLANA_CLUSTER}`;
  return `https://solscan.io/tx/${encodeURIComponent(signature)}${q}`;
}
