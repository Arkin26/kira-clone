# Solana Skill — K-INTENT Blockchain Layer
# =========================================
# DROP THIS FILE AT: .cursor/skills/solana/SKILL.md
# USAGE: Type @.cursor/skills/solana/SKILL.md in Cursor chat when working on blockchain logic
# =========================================

## What This Skill Covers
Solana Devnet setup, transaction verification, `@solana/web3.js` patterns, and the
non-custodial architecture rules for K-INTENT.

---

## Core Architecture Rule (Non-Negotiable)

```
FRONTEND (Wallet Adapter)     BACKEND (SolanaService)
        |                              |
   Signs TX ──── sends signature ───▶ Verifies TX on-chain
        |                              |
   Never touches                  Never touches
   private keys                   private keys
```

The backend is a VERIFIER only. It never constructs, signs, or broadcasts transactions.

---

## SolanaService (The Complete Implementation)

```typescript
// backend/src/solana/solana.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  Connection,
  PublicKey,
  LAMPORTS_PER_SOL,
  ParsedTransactionWithMeta,
} from '@solana/web3.js';

export interface VerificationResult {
  isValid: boolean;
  fromAddress: string | null;
  toAddress: string | null;
  amountSol: number | null;
  slot: number | null;
  error?: string;
}

@Injectable()
export class SolanaService {
  private readonly logger = new Logger(SolanaService.name);
  private readonly connection: Connection;
  private readonly merchantWallet: PublicKey;

  constructor(private readonly config: ConfigService) {
    this.connection = new Connection(
      this.config.get<string>('SOLANA_RPC_URL') ?? 'https://api.devnet.solana.com',
      'finalized', // Always use finalized commitment
    );
    this.merchantWallet = new PublicKey(
      this.config.get<string>('MERCHANT_WALLET_ADDRESS') ?? '',
    );
  }

  /**
   * Polls the Solana blockchain until a transaction reaches "finalized" status.
   * Returns the parsed transaction or throws on timeout.
   */
  async waitForFinalization(
    signature: string,
    timeoutMs = 60000,
  ): Promise<ParsedTransactionWithMeta> {
    this.logger.log(`Waiting for finalization: ${signature}`);

    const start = Date.now();
    const pollIntervalMs = 3000;

    while (Date.now() - start < timeoutMs) {
      try {
        const status = await this.connection.getSignatureStatus(signature, {
          searchTransactionHistory: true,
        });

        const confirmationStatus = status?.value?.confirmationStatus;

        if (confirmationStatus === 'finalized') {
          this.logger.log(`Transaction finalized: ${signature}`);
          const tx = await this.connection.getParsedTransaction(signature, {
            commitment: 'finalized',
            maxSupportedTransactionVersion: 0,
          });
          if (!tx) throw new Error('Transaction not found after finalization');
          return tx;
        }

        this.logger.log(`Status: ${confirmationStatus ?? 'unknown'} — waiting...`);
      } catch (err) {
        this.logger.warn(`Poll error for ${signature}: ${err}`);
      }

      await this.sleep(pollIntervalMs);
    }

    throw new Error(`Transaction ${signature} did not finalize within ${timeoutMs}ms`);
  }

  /**
   * Verifies that a transaction:
   * 1. Is finalized on-chain
   * 2. Sent SOL to the merchant wallet
   * 3. Transferred the expected amount (with tolerance)
   */
  async verifyPayment(
    signature: string,
    expectedAmountSol: number,
  ): Promise<VerificationResult> {
    try {
      const tx = await this.waitForFinalization(signature);

      if (tx.meta?.err) {
        return { isValid: false, fromAddress: null, toAddress: null, amountSol: null, slot: null, error: 'Transaction failed on-chain' };
      }

      const instructions = tx.transaction.message.instructions;
      const accountKeys = tx.transaction.message.accountKeys;

      // Find a SOL transfer to the merchant wallet
      for (const ix of instructions) {
        if ('parsed' in ix && ix.program === 'system' && ix.parsed?.type === 'transfer') {
          const { source, destination, lamports } = ix.parsed.info;
          const amountSol = lamports / LAMPORTS_PER_SOL;
          const tolerance = 0.001; // Allow 0.001 SOL tolerance for network fees

          if (
            destination === this.merchantWallet.toBase58() &&
            Math.abs(amountSol - expectedAmountSol) <= tolerance
          ) {
            return {
              isValid: true,
              fromAddress: source,
              toAddress: destination,
              amountSol,
              slot: tx.slot,
            };
          }
        }
      }

      return {
        isValid: false,
        fromAddress: null,
        toAddress: null,
        amountSol: null,
        slot: null,
        error: 'No matching SOL transfer to merchant wallet found',
      };
    } catch (error) {
      this.logger.error(`Verification failed for ${signature}`, error);
      return {
        isValid: false,
        fromAddress: null,
        toAddress: null,
        amountSol: null,
        slot: null,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
```

---

## Solana Module

```typescript
// backend/src/solana/solana.module.ts
import { Module } from '@nestjs/common';
import { SolanaService } from './solana.service';

@Module({
  providers: [SolanaService],
  exports: [SolanaService],
})
export class SolanaModule {}
```

---

## Frontend: Transaction Construction (Next.js)

This is the ONLY place transactions are built and signed. Never do this on the backend.

```typescript
// frontend/src/lib/solana.ts
import {
  Connection,
  PublicKey,
  SystemProgram,
  Transaction,
  LAMPORTS_PER_SOL,
} from '@solana/web3.js';

const MERCHANT_WALLET = new PublicKey(process.env.NEXT_PUBLIC_MERCHANT_WALLET!);
const connection = new Connection(
  process.env.NEXT_PUBLIC_SOLANA_RPC ?? 'https://api.devnet.solana.com',
  'confirmed',
);

/**
 * Builds and sends a SOL transfer transaction via the user's connected wallet.
 * Returns the transaction signature for backend verification.
 */
export async function sendSolPayment(
  walletPublicKey: PublicKey,
  sendTransaction: (tx: Transaction, connection: Connection) => Promise<string>,
  amountSol: number,
): Promise<string> {
  const lamports = Math.round(amountSol * LAMPORTS_PER_SOL);

  const transaction = new Transaction().add(
    SystemProgram.transfer({
      fromPubkey: walletPublicKey,
      toPubkey: MERCHANT_WALLET,
      lamports,
    }),
  );

  const { blockhash } = await connection.getLatestBlockhash();
  transaction.recentBlockhash = blockhash;
  transaction.feePayer = walletPublicKey;

  const signature = await sendTransaction(transaction, connection);
  return signature;
}
```

---

## Frontend Environment Variables

```env
NEXT_PUBLIC_SOLANA_RPC=https://api.devnet.solana.com
NEXT_PUBLIC_MERCHANT_WALLET=your_devnet_wallet_address_here
```

---

## Rules

1. **Backend NEVER signs anything** — it only reads the chain
2. Always use `finalized` commitment on the backend for security
3. Always check `tx.meta?.err` — a confirmed tx can still have failed
4. The `@unique` constraint on `signature` in Prisma prevents replay attacks
5. Always validate the destination address matches the merchant wallet
6. Always add amount tolerance (~0.001 SOL) to account for rounding
7. Never trust the frontend's claim of "amount paid" — always read from chain

---

## Devnet Setup Checklist

```bash
# Install Solana CLI (optional but useful for debugging)
sh -c "$(curl -sSfL https://release.solana.com/stable/install)"

# Set CLI to devnet
solana config set --url devnet

# Check your wallet balance
solana balance YOUR_WALLET_ADDRESS --url devnet

# Airdrop 1 SOL for testing (max 2 per request on devnet)
solana airdrop 1 YOUR_WALLET_ADDRESS --url devnet
```

```bash
# Install web3.js
npm install @solana/web3.js
npm install @solana/wallet-adapter-react @solana/wallet-adapter-wallets @solana/wallet-adapter-base
```