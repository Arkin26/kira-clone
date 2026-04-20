import { createConfig, http } from "wagmi";
import { injected } from "wagmi/connectors";
import { sepolia } from "viem/chains";

const evmRpc = process.env.NEXT_PUBLIC_EVM_RPC_URL ?? "https://rpc.sepolia.org";

/** Used when `NEXT_PUBLIC_PRIVY_APP_ID` is unset — injected browser wallet only (e.g. MetaMask). */
export const fallbackWagmiConfig = createConfig({
  chains: [sepolia],
  connectors: [injected()],
  transports: {
    [sepolia.id]: http(evmRpc),
  },
});
