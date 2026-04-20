"use client";

import { useWallet } from "@solana/wallet-adapter-react";
import { useMemo } from "react";
import { useAccount } from "wagmi";

/**
 * Addresses to scope `/payments` + metrics as payer or treasury (comma-separated for the API).
 * Uses connected Solana + EVM wallets from the client.
 */
export function useInvolvedWalletAddresses(): string[] {
  const { publicKey } = useWallet();
  const { address } = useAccount();

  return useMemo(() => {
    const out: string[] = [];
    if (publicKey) out.push(publicKey.toBase58());
    if (address) out.push(address.toLowerCase());
    return Array.from(new Set(out));
  }, [publicKey, address]);
}
