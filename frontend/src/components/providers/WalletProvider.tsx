"use client";

import type { Adapter } from "@solana/wallet-adapter-base";
import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";
import { ConnectionProvider, WalletProvider } from "@solana/wallet-adapter-react";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import { PhantomWalletAdapter } from "@solana/wallet-adapter-phantom";
import { SolflareWalletAdapter } from "@solana/wallet-adapter-solflare";
import { clusterApiUrl } from "@solana/web3.js";
import { useMemo, type ComponentType, type ReactNode } from "react";

import "@solana/wallet-adapter-react-ui/styles.css";

type Props = { children: ReactNode };

/** Bridges React 18 / @types/react vs wallet-adapter nested type expectations. */
const ConnectionProviderBridge = ConnectionProvider as unknown as ComponentType<{
  endpoint: string;
  children?: ReactNode;
}>;
const WalletProviderBridge = WalletProvider as unknown as ComponentType<{
  wallets: Adapter[];
  autoConnect?: boolean;
  children?: ReactNode;
}>;
const WalletModalProviderBridge = WalletModalProvider as unknown as ComponentType<{
  children?: ReactNode;
}>;

export function SolanaWalletProvider({ children }: Props) {
  const network = WalletAdapterNetwork.Devnet;
  const endpoint = useMemo(
    () =>
      process.env.NEXT_PUBLIC_SOLANA_RPC?.trim() ||
      clusterApiUrl(network),
    [network],
  );

  const wallets = useMemo(
    () => [new PhantomWalletAdapter(), new SolflareWalletAdapter({ network })],
    [network],
  );

  return (
    <ConnectionProviderBridge endpoint={endpoint}>
      <WalletProviderBridge wallets={wallets} autoConnect>
        <WalletModalProviderBridge>{children}</WalletModalProviderBridge>
      </WalletProviderBridge>
    </ConnectionProviderBridge>
  );
}
