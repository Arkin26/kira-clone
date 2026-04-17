import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
  RequestTimeoutException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PaymentIntent, PaymentIntentStatus, Prisma } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';
import { Connection, LAMPORTS_PER_SOL, ParsedTransactionWithMeta } from '@solana/web3.js';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePaymentIntentDto } from './dto/create-payment-intent.dto';
import type { PaymentMetricsDto } from './payments.types';
import { SerializedPaymentIntent } from './payments.types';

const FINALIZE_POLL_MS = 2000;
const FINALIZE_TIMEOUT_MS = 60_000;
const RPC_MAX_ATTEMPTS = 4;
const RPC_BASE_DELAY_MS = 400;

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);
  private readonly connection: Connection;

  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
  ) {
    const rpcUrl = this.config.get<string>('RPC_URL') ?? 'https://api.devnet.solana.com';
    this.logger.log(`Solana blockchain client targeting: ${rpcUrl} (commitment: finalized)`);
    this.connection = new Connection(rpcUrl, { commitment: 'finalized' });
  }

  /**
   * Persists a new payment intent in `PENDING` state.
   */
  async createIntent(dto: CreatePaymentIntentDto): Promise<PaymentIntent> {
    this.assertPositiveFiniteAmount(dto.amount);
    return this.prisma.paymentIntent.create({
      data: {
        merchantId: dto.merchantId,
        amount: new Prisma.Decimal(dto.amount),
        currency: 'SOL',
        status: PaymentIntentStatus.PENDING,
      },
    });
  }

  /** Defense in depth with DTO validation — rejects non-finite and non-positive amounts. */
  private assertPositiveFiniteAmount(amount: number): void {
    if (typeof amount !== 'number' || !Number.isFinite(amount) || amount <= 0) {
      throw new BadRequestException('Amount must be a finite number greater than zero');
    }
  }

  serializeIntent(intent: PaymentIntent): SerializedPaymentIntent {
    return {
      ...intent,
      amount: intent.amount.toString(),
    };
  }

  /**
   * Lists recent payment intents, optionally filtered by intent id or signature substring (case-insensitive).
   */
  async listPayments(search?: string): Promise<SerializedPaymentIntent[]> {
    const rows = await this.prisma.paymentIntent.findMany({
      orderBy: { createdAt: 'desc' },
      take: 1000,
    });
    const serialized = rows.map((r) => this.serializeIntent(r));
    const q = search?.trim().toLowerCase();
    if (!q) {
      return serialized;
    }
    return serialized.filter(
      (row) =>
        row.id.toLowerCase().includes(q) ||
        (row.signature !== null && row.signature.toLowerCase().includes(q)),
    );
  }

  /**
   * Sum of amounts for SUCCESS intents and row counts for dashboard metrics.
   */
  async getPaymentMetrics(): Promise<PaymentMetricsDto> {
    const [agg, totalCount] = await Promise.all([
      this.prisma.paymentIntent.aggregate({
        where: { status: PaymentIntentStatus.SUCCESS },
        _sum: { amount: true },
        _count: true,
      }),
      this.prisma.paymentIntent.count(),
    ]);
    const sum = agg._sum.amount;
    return {
      totalVolumeSol: sum !== null && sum !== undefined ? sum.toString() : '0',
      successCount: agg._count,
      totalCount,
    };
  }

  /**
   * Waits until the transaction is finalized on Solana Devnet, validates execution and amount
   * against the intent (fee-payer outbound SOL, excluding network fee), then updates the row.
   *
   * Idempotency: the same `(intentId, signature)` success pair can be applied once; signatures
   * are unique on success. A signature linked to another intent is rejected.
   */
  async verifyTransaction(signature: string, intentId: string): Promise<SerializedPaymentIntent> {
    const intent = await this.prisma.paymentIntent.findUnique({ where: { id: intentId } });
    if (!intent) {
      throw new NotFoundException(`Payment intent ${intentId} not found`);
    }

    if (intent.status === PaymentIntentStatus.SUCCESS) {
      if (intent.signature === signature) {
        this.logger.log(`Idempotent verify: intent ${intentId} already SUCCESS for ${signature}`);
        return this.serializeIntent(intent);
      }
      throw new BadRequestException('Intent is already settled with a different signature');
    }

    const signatureOwner = await this.prisma.paymentIntent.findFirst({
      where: { signature },
    });
    if (signatureOwner && signatureOwner.id !== intentId) {
      throw new BadRequestException('This signature has already been processed for another intent');
    }

    if (intent.status !== PaymentIntentStatus.PENDING && intent.status !== PaymentIntentStatus.FAILED) {
      throw new BadRequestException(`Intent cannot be verified from status ${intent.status}`);
    }

    let parsed: ParsedTransactionWithMeta | null;
    try {
      parsed = await this.waitForFinalizedTransaction(signature);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      this.logger.error(`Blockchain verification failed for ${signature}: ${message}`);
      throw new ServiceUnavailableException(
        'Unable to confirm the transaction on Solana Devnet. Retry later.',
      );
    }

    if (!parsed) {
      this.logger.warn(`Signature ${signature} not finalized within ${FINALIZE_TIMEOUT_MS}ms; intent left PENDING`);
      throw new RequestTimeoutException(
        'Transaction was not finalized on Solana Devnet within the allowed window. No database changes were applied.',
      );
    }

    const chainError = parsed.meta?.err != null;
    const amountOk = this.transactionMatchesIntentAmount(parsed, intent);

    if (chainError || !amountOk) {
      this.logger.warn(
        `Verification rejected for ${signature}: chainError=${Boolean(chainError)} amountOk=${amountOk}`,
      );
      await this.markIntentFailed(intentId);
      const failed = await this.prisma.paymentIntent.findUniqueOrThrow({ where: { id: intentId } });
      return this.serializeIntent(failed);
    }

    try {
      const updated = await this.prisma.$transaction(async (tx) => {
        const current = await tx.paymentIntent.findUnique({ where: { id: intentId } });
        if (!current) {
          throw new NotFoundException(`Payment intent ${intentId} not found`);
        }
        if (current.status === PaymentIntentStatus.SUCCESS && current.signature === signature) {
          return current;
        }
        if (current.status === PaymentIntentStatus.SUCCESS) {
          throw new BadRequestException('Intent is already settled with a different signature');
        }

        const clash = await tx.paymentIntent.findFirst({ where: { signature } });
        if (clash && clash.id !== intentId) {
          throw new BadRequestException('This signature has already been processed for another intent');
        }

        return tx.paymentIntent.update({
          where: { id: intentId },
          data: {
            status: PaymentIntentStatus.SUCCESS,
            signature,
          },
        });
      });

      this.logger.log(`Intent ${intentId} marked SUCCESS for signature ${signature}`);
      return this.serializeIntent(updated);
    } catch (err) {
      if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
        throw new BadRequestException('This signature has already been processed for another intent');
      }
      throw err;
    }
  }

  private async markIntentFailed(intentId: string): Promise<void> {
    await this.prisma.paymentIntent.updateMany({
      where: {
        id: intentId,
        status: { in: [PaymentIntentStatus.PENDING, PaymentIntentStatus.FAILED] },
      },
      data: { status: PaymentIntentStatus.FAILED },
    });
  }

  /**
   * Phase-1 heuristic: first account (fee payer) must have sent at least the intent amount in SOL
   * excluding the protocol fee. Production should pin a treasury `PublicKey` and parse transfers.
   */
  private transactionMatchesIntentAmount(
    tx: ParsedTransactionWithMeta,
    intent: PaymentIntent,
  ): boolean {
    if (intent.currency !== 'SOL') {
      this.logger.warn(`Non-SOL currency on intent ${intent.id}; amount check skipped (treated as fail)`);
      return false;
    }
    const meta = tx.meta;
    if (!meta?.preBalances?.length || !meta.postBalances?.length) {
      return false;
    }
    const payerPre = BigInt(meta.preBalances[0]);
    const payerPost = BigInt(meta.postBalances[0]);
    const fee = BigInt(meta.fee);
    const outboundTransferLamports = payerPre - payerPost - fee;
    const required = this.intentAmountToLamports(intent.amount);
    return outboundTransferLamports >= required;
  }

  private intentAmountToLamports(amount: Prisma.Decimal): bigint {
    const lamportsDecimal = new Decimal(amount.toString())
      .mul(LAMPORTS_PER_SOL)
      .toDecimalPlaces(0, Decimal.ROUND_DOWN);
    return BigInt(lamportsDecimal.toFixed(0));
  }

  private async waitForFinalizedTransaction(signature: string): Promise<ParsedTransactionWithMeta | null> {
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
