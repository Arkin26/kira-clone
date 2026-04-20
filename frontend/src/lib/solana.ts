import {
  createAssociatedTokenAccountIdempotentInstructionWithDerivation,
  createTransferCheckedInstruction,
  getAssociatedTokenAddressSync,
  getAccount,
  getMint,
  TOKEN_PROGRAM_ID,
} from "@solana/spl-token";
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
 * Builds a native SOL transfer from the connected wallet (fee payer) to the merchant treasury.
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

/**
 * SPL token transfer (e.g. devnet USDC) to the merchant treasury ATA.
 * Creates the destination ATA idempotently if missing (payer = `from`).
 */
export async function sendSplTokenPayment(params: {
  connection: Connection;
  from: PublicKey;
  toOwner: PublicKey;
  mint: PublicKey;
  humanAmount: number;
  sendTransaction: (
    transaction: Transaction,
    connection: Connection,
    options?: SendOptions,
  ) => Promise<string>;
}): Promise<string> {
  const { connection, from, toOwner, mint, humanAmount, sendTransaction } = params;

  const mintInfo = await getMint(connection, mint);
  const decimals = mintInfo.decimals;
  const factor = 10 ** decimals;
  const raw = BigInt(Math.floor(humanAmount * factor));

  const sourceAta = getAssociatedTokenAddressSync(mint, from);
  try {
    await getAccount(connection, sourceAta);
  } catch {
    throw new Error(
      "No token account for this mint. Fund your wallet with devnet USDC (or create an ATA) first.",
    );
  }

  const destAta = getAssociatedTokenAddressSync(mint, toOwner);
  const destInfo = await connection.getAccountInfo(destAta);

  const { blockhash, lastValidBlockHeight } =
    await connection.getLatestBlockhash("finalized");

  const tx = new Transaction();

  if (!destInfo) {
    tx.add(
      createAssociatedTokenAccountIdempotentInstructionWithDerivation(from, toOwner, mint, false),
    );
  }

  tx.add(
    createTransferCheckedInstruction(
      sourceAta,
      mint,
      destAta,
      from,
      raw,
      decimals,
      [],
      TOKEN_PROGRAM_ID,
    ),
  );

  tx.feePayer = from;
  tx.recentBlockhash = blockhash;

  const signature = await sendTransaction(tx, connection, {
    skipPreflight: false,
    maxRetries: 3,
  });
  await connection.confirmTransaction(
    { signature, blockhash, lastValidBlockHeight },
    "confirmed",
  );
  return signature;
}
