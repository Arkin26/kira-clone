import {
  LAMPORTS_PER_SOL,
  PublicKey,
  SystemProgram,
  Transaction,
  type Connection,
  type SendOptions,
} from "@solana/web3.js";

export function solToLamports(sol: number): number {
  return Math.round(sol * LAMPORTS_PER_SOL);
}

/**
 * Builds a native SOL transfer from the connected wallet (fee payer) to the merchant.
 */
export function buildSolPaymentTransaction(params: {
  from: PublicKey;
  to: PublicKey;
  solAmount: number;
  recentBlockhash: string;
}): Transaction {
  const lamports = solToLamports(params.solAmount);
  const ix = SystemProgram.transfer({
    fromPubkey: params.from,
    toPubkey: params.to,
    lamports,
  });
  const tx = new Transaction().add(ix);
  tx.feePayer = params.from;
  tx.recentBlockhash = params.recentBlockhash;
  return tx;
}

export async function sendSolPayment(params: {
  connection: Connection;
  from: PublicKey;
  to: PublicKey;
  solAmount: number;
  sendTransaction: (
    transaction: Transaction,
    connection: Connection,
    options?: SendOptions,
  ) => Promise<string>;
}): Promise<string> {
  const { blockhash, lastValidBlockHeight } =
    await params.connection.getLatestBlockhash("finalized");
  const tx = buildSolPaymentTransaction({
    from: params.from,
    to: params.to,
    solAmount: params.solAmount,
    recentBlockhash: blockhash,
  });
  const signature = await params.sendTransaction(tx, params.connection, {
    skipPreflight: false,
    maxRetries: 3,
  });
  await params.connection.confirmTransaction(
    { signature, blockhash, lastValidBlockHeight },
    "confirmed",
  );
  return signature;
}
