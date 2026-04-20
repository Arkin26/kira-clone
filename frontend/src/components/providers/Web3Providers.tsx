"use client";

import { PrivyProvider } from "@privy-io/react-auth";
import { WagmiProvider as PrivyWagmiProvider } from "@privy-io/wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { useState } from "react";
import { WagmiProvider } from "wagmi";

import { fallbackWagmiConfig } from "@/lib/fallback-wagmi-config";
import { evmChain, wagmiConfig } from "@/lib/wagmi-config";

import { SolanaWalletProvider } from "./WalletProvider";

const privyAppId = process.env.NEXT_PUBLIC_PRIVY_APP_ID?.trim() ?? "";

/**
 * Privy + wagmi (EVM) + Solana wallet-adapter (Phantom / Solflare).
 * Without `NEXT_PUBLIC_PRIVY_APP_ID`, EVM checkout is disabled and only Solana providers load.
 */
export function Web3Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 30_000,
            refetchOnWindowFocus: true,
          },
        },
      }),
  );

  if (!privyAppId) {
    return (
      <QueryClientProvider client={queryClient}>
        <WagmiProvider config={fallbackWagmiConfig}>
          <SolanaWalletProvider>{children}</SolanaWalletProvider>
        </WagmiProvider>
      </QueryClientProvider>
    );
  }

  return (
    <PrivyProvider
      appId={privyAppId}
      config={{
        appearance: { theme: "dark" },
        embeddedWallets: {
          ethereum: { createOnLogin: "users-without-wallets" },
          solana: { createOnLogin: "users-without-wallets" },
        },
        supportedChains: [evmChain],
      }}
    >
      <QueryClientProvider client={queryClient}>
        <PrivyWagmiProvider config={wagmiConfig}>
          <SolanaWalletProvider>{children}</SolanaWalletProvider>
        </PrivyWagmiProvider>
      </QueryClientProvider>
    </PrivyProvider>
  );
}
