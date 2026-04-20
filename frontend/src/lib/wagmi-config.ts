import { createConfig } from "@privy-io/wagmi";
import { http } from "wagmi";
import { sepolia } from "viem/chains";

const evmRpc = process.env.NEXT_PUBLIC_EVM_RPC_URL ?? "https://rpc.sepolia.org";

/** Default EVM testnet — matches backend `eip155:11155111` intents. */
export const evmChain = sepolia;

export const wagmiConfig = createConfig({
  chains: [sepolia],
  transports: {
    [sepolia.id]: http(evmRpc),
  },
});
