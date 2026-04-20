import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AssetKind, PaymentIntent } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';
import { Connection, LAMPORTS_PER_SOL, ParsedTransactionWithMeta, PublicKey } from '@solana/web3.js';
import { PrismaService } from '../prisma/prisma.service';

const FINALIZE_POLL_MS = 2000;
const FINALIZE_TIMEOUT_MS = 60_000;
const RPC_MAX_ATTEMPTS = 4;
const RPC_BASE_DELAY_MS = 400;

/**
 * Solana RPC polling, finalization, and settlement checks (native SOL + SPL).
 * Treasury must receive funds at `intent.treasuryAddress`.
 */
@Injectable()
export class SolanaSettlementService {
  private readonly logger = new Logger(SolanaSettlementService.name);
  private readonly connection: Connection;

  constructor(
    private readonly config: ConfigService,
    private readonly prisma: PrismaService,
  ) {
    const rpcUrl = this.config.get<string>('RPC_URL') ?? 'https://api.devnet.solana.com';
    this.logger.log(`Solana RPC: ${rpcUrl} (commitment: finalized)`);
    this.connection = new Connection(rpcUrl, { commitment: 'finalized' });
  }

  getConnection(): Connection {
    return this.connection;
  }

  async waitForFinalizedTransaction(signature: string): Promise<ParsedTransactionWithMeta | null> {
    const started = Date.now();
    this.logger.log(`Polling finalization for signature ${signature}`);

    while (Date.now() - started < FINALIZE_TIMEOUT_MS) {
      const status = await this.withRpcRetry('getSignatureStatuses', () =>
        this.connection.getSignatureStatuses([signature], { searchTransactionHistory: true }),
      );

      const confirmationStatus = status?.value[0]?.confirmationStatus;
      if (confirmationStatus === 'finalized') {
        this.logger.log(`Signature ${signature} reached finalized commitment`);
        const parsed = await this.withRpcRetry('getParsedTransaction', () =>
          this.connection.getParsedTransaction(signature, {
            commitment: 'finalized',
            maxSupportedTransactionVersion: 0,
          }),
        );
        return parsed;
      }

      this.logger.debug(
        `Signature ${signature} status: ${confirmationStatus ?? 'unknown'} — waiting ${FINALIZE_POLL_MS}ms`,
      );
      await this.delay(FINALIZE_POLL_MS);
    }

    this.logger.warn(`Timed out waiting for finalization: ${signature}`);
    return null;
  }

  /** Returns true if on-chain settlement matches the intent (treasury + amount). */
  async verifySettlement(parsed: ParsedTransactionWithMeta, intent: PaymentIntent): Promise<boolean> {
    if (!intent.chainId.startsWith('solana:')) {
      this.logger.warn(`Not a Solana chainId: ${intent.chainId}`);
      return false;
    }

    if (intent.assetKind === AssetKind.NATIVE_SOL) {
      return this.verifyNativeSol(parsed, intent);
    }
    if (intent.assetKind === AssetKind.SPL_TOKEN) {
      return await this.verifySplToken(parsed, intent);
    }
    this.logger.warn(`Unexpected assetKind ${intent.assetKind} for Solana verifier`);
    return false;
  }

  private verifyNativeSol(tx: ParsedTransactionWithMeta, intent: PaymentIntent): boolean {
    if (intent.currency !== 'SOL') {
      return false;
    }
    const treasury = intent.treasuryAddress;
    const required = this.intentAmountToLamports(intent.amount);
    const meta = tx.meta;
    if (!meta?.preBalances?.length || !meta.postBalances?.length) {
      return false;
    }

    const accountKeys = this.getAccountKeys(tx);
    const treasuryIdx = accountKeys.findIndex((k) => k.toBase58() === treasury);
    if (treasuryIdx === -1) {
      this.logger.warn(`Treasury ${treasury} not in transaction accounts`);
      return false;
    }

    const pre = BigInt(meta.preBalances[treasuryIdx] ?? 0);
    const post = BigInt(meta.postBalances[treasuryIdx] ?? 0);
    const inbound = post - pre;
    if (inbound < required) {
      this.logger.warn(`Treasury inbound ${inbound} lamports < required ${required}`);
      return false;
    }

    return true;
  }

  private async verifySplToken(tx: ParsedTransactionWithMeta, intent: PaymentIntent): Promise<boolean> {
    const mint = intent.mintAddress;
    if (!mint) {
      return false;
    }
    const treasury = intent.treasuryAddress;
    const meta = tx.meta;
    if (!meta) {
      return false;
    }

    const requiredRaw = await this.computeRequiredSplRawAmount(intent);

    const preBalances = meta.preTokenBalances ?? [];
    const postBalances = meta.postTokenBalances ?? [];

    const preByIndex = new Map(
      preBalances.filter((b): b is NonNullable<typeof b> => b != null).map((b) => [b.accountIndex, b]),
    );

    for (const post of postBalances) {
      if (post == null) continue;
      if (post.mint !== mint) continue;
      if (post.owner !== treasury) continue;

      const pre = preByIndex.get(post.accountIndex);
      const preAmt =
        pre && pre.mint === mint ? BigInt(pre.uiTokenAmount?.amount ?? '0') : 0n;
      const postAmt = BigInt(post.uiTokenAmount?.amount ?? '0');
      const delta = postAmt - preAmt;
      if (delta >= requiredRaw) {
        return true;
      }
    }

    this.logger.warn(`SPL verification failed: mint ${mint} treasury owner ${treasury}`);
    return false;
  }

  private async computeRequiredSplRawAmount(intent: PaymentIntent): Promise<bigint> {
    if (!intent.mintAddress) {
      return 0n;
    }
    const row = await this.prisma.merchantAssetAllowlist.findUnique({
      where: {
        merchantId_chainId_mint: {
          merchantId: intent.merchantId,
          chainId: intent.chainId,
          mint: intent.mintAddress,
        },
      },
    });
    const decimals = row?.decimals ?? 6;
    const raw = new Decimal(intent.amount.toString())
      .mul(new Decimal(10).pow(decimals))
      .toDecimalPlaces(0, Decimal.ROUND_DOWN);
    return BigInt(raw.toFixed(0));
  }

  /** Fee payer is the first account in the legacy / decompiled message account list. */
  extractFeePayerAddress(parsed: ParsedTransactionWithMeta): string | null {
    const keys = this.getAccountKeys(parsed);
    if (keys.length === 0) {
      return null;
    }
    return keys[0].toBase58();
  }

  private getAccountKeys(tx: ParsedTransactionWithMeta): PublicKey[] {
    const msg = tx.transaction.message;
    const keys = msg.accountKeys;
    if (!keys?.length) {
      return [];
    }
    return keys.map((k) => {
      if (k instanceof PublicKey) {
        return k;
      }
      if (typeof k === 'object' && k !== null && 'pubkey' in k) {
        return (k as { pubkey: PublicKey }).pubkey;
      }
      return k as PublicKey;
    });
  }

  private intentAmountToLamports(amount: InstanceType<typeof Decimal>): bigint {
    const lamportsDecimal = new Decimal(amount.toString())
      .mul(LAMPORTS_PER_SOL)
      .toDecimalPlaces(0, Decimal.ROUND_DOWN);
    return BigInt(lamportsDecimal.toFixed(0));
  }

  private async withRpcRetry<T>(operation: string, fn: () => Promise<T>): Promise<T> {
    let lastError: unknown;
    for (let attempt = 1; attempt <= RPC_MAX_ATTEMPTS; attempt += 1) {
      try {
        return await fn();
      } catch (err) {
        lastError = err;
        const message = err instanceof Error ? err.message : String(err);
        this.logger.warn(`RPC ${operation} attempt ${attempt}/${RPC_MAX_ATTEMPTS} failed: ${message}`);
        await this.delay(RPC_BASE_DELAY_MS * attempt);
      }
    }
    throw lastError instanceof Error ? lastError : new Error(String(lastError));
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => {
      setTimeout(resolve, ms);
    });
  }
}
