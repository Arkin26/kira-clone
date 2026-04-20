import { erc20Abi, isAddress, parseEther, parseUnits } from "viem";

export function assertEvmAddress(addr: string): `0x${string}` {
  const t = addr.trim();
  if (!isAddress(t)) {
    throw new Error("Enter a valid EVM address (0x…).");
  }
  return t as `0x${string}`;
}

export function buildNativeTransferTx(to: `0x${string}`, amountHuman: string) {
  return {
    to,
    value: parseEther(amountHuman),
  } as const;
}

export function buildErc20TransferCall(
  token: `0x${string}`,
  to: `0x${string}`,
  amountHuman: string,
  decimals: number,
) {
  return {
    address: token,
    abi: erc20Abi,
    functionName: "transfer" as const,
    args: [to, parseUnits(amountHuman, decimals)],
  } as const;
}
