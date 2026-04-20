import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
  RequestTimeoutException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AssetKind, PaymentIntent, PaymentIntentStatus, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { EvmSettlementService } from '../evm/evm-settlement.service';
import { SolanaSettlementService } from '../solana/solana-settlement.service';
import { WebhooksService } from '../webhooks/webhooks.service';
import { CreatePaymentIntentDto } from './dto/create-payment-intent.dto';
import type { PaymentMetricsDto } from './payments.types';
import { SerializedPaymentIntent } from './payments.types';
import { normalizeRecipientFilter, normalizeTreasuryAddress } from './treasury-address.util';

const FINALIZE_TIMEOUT_MS = 60_000;

function parseEip155ChainId(chainId: string): number {
  const m = /^eip155:(\d+)$/.exec(chainId.trim());
  if (!m) {
    throw new BadRequestException(`Invalid EIP-155 chainId: ${chainId}`);
  }
  return parseInt(m[1], 10);
}

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
    private readonly solana: SolanaSettlementService,
    private readonly evm: EvmSettlementService,
    private readonly webhooks: WebhooksService,
  ) {}

  async createIntent(dto: CreatePaymentIntentDto): Promise<PaymentIntent> {
    this.assertPositiveFiniteAmount(dto.amount);

    await this.prisma.merchant.upsert({
      where: { id: dto.merchantId },
      create: { id: dto.merchantId },
      update: {},
    });

    const chainId = dto.chainId?.trim() || 'solana:devnet';
    let assetKind = dto.assetKind;
    if (assetKind == null) {
      assetKind = chainId.startsWith('eip155:') ? AssetKind.EVM_NATIVE : AssetKind.NATIVE_SOL;
    }

    let treasuryAddress: string;
    let evmChainId: number | null = null;
    const mintAddress = dto.mintAddress?.trim() ?? null;
    let currency: string;

    if (chainId.startsWith('eip155:')) {
      const explicitEvm = dto.treasuryAddress?.trim();
      if (explicitEvm) {
        treasuryAddress = normalizeTreasuryAddress(chainId, explicitEvm);
      } else {
        const evmTreasury = this.config.get<string>('EVM_TREASURY_ADDRESS')?.trim();
        if (!evmTreasury) {
          throw new BadRequestException(
            'Provide treasuryAddress in the request or configure EVM_TREASURY_ADDRESS on the server',
          );
        }
        treasuryAddress = normalizeTreasuryAddress(chainId, evmTreasury);
      }
      evmChainId = parseEip155ChainId(chainId);

      if (assetKind === AssetKind.EVM_ERC20) {
        if (!mintAddress) {
          throw new BadRequestException('mintAddress is required for EVM_ERC20');
        }
        const row = await this.prisma.merchantAssetAllowlist.findUnique({
          where: {
            merchantId_chainId_mint: {
              merchantId: dto.merchantId,
              chainId,
              mint: mintAddress.toLowerCase(),
            },
          },
        });
        if (!row) {
          throw new BadRequestException('Token is not allowlisted for this merchant and chain');
        }
        currency = row.symbol ?? 'ERC20';
      } else if (assetKind === AssetKind.EVM_NATIVE) {
        currency = 'ETH';
      } else {
        throw new BadRequestException('EVM intents require assetKind EVM_NATIVE or EVM_ERC20');
      }
    } else {
      const explicitSol = dto.treasuryAddress?.trim();
      if (explicitSol) {
        treasuryAddress = normalizeTreasuryAddress(chainId, explicitSol);
      } else {
        const solTreasury = this.config.get<string>('TREASURY_PUBLIC_KEY')?.trim();
        if (!solTreasury) {
          throw new BadRequestException(
            'Provide treasuryAddress in the request or configure TREASURY_PUBLIC_KEY on the server',
          );
        }
        treasuryAddress = normalizeTreasuryAddress(chainId, solTreasury);
      }

      if (assetKind === AssetKind.SPL_TOKEN) {
        if (!mintAddress) {
          throw new BadRequestException('mintAddress is required for SPL_TOKEN');
        }
        const row = await this.prisma.merchantAssetAllowlist.findUnique({
          where: {
            merchantId_chainId_mint: {
              merchantId: dto.merchantId,
              chainId,
              mint: mintAddress,
            },
          },
        });
        if (!row) {
          throw new BadRequestException('Mint is not allowlisted for this merchant and chain');
        }
        currency = row.symbol ?? 'SPL';
      } else if (assetKind === AssetKind.NATIVE_SOL) {
        currency = 'SOL';
      } else {
        throw new BadRequestException('Solana intents require assetKind NATIVE_SOL or SPL_TOKEN');
      }
    }

    return this.prisma.paymentIntent.create({
      data: {
        merchantId: dto.merchantId,
        amount: new Prisma.Decimal(dto.amount),
        currency,
        status: PaymentIntentStatus.PENDING,
        chainId,
        assetKind,
        mintAddress,
        treasuryAddress,
        evmChainId,
      },
    });
  }

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
   * Dashboard / feed: optional treasury filter plus optional "involved" wallets
   * (matches either `treasuryAddress` or `payerAddress` for each address).
   */
  private buildListWhere(
    recipientRaw?: string,
    involvedRaw?: string,
  ): Prisma.PaymentIntentWhereInput | undefined {
    const recipientNorm =
      recipientRaw != null && recipientRaw.trim() !== ''
        ? normalizeRecipientFilter(recipientRaw)
        : undefined;

    const involvedParts =
      involvedRaw != null && involvedRaw.trim() !== ''
        ? involvedRaw
            .split(',')
            .map((s) => s.trim())
            .filter(Boolean)
        : [];

    const involvedNorm =
      involvedParts.length > 0
        ? involvedParts.map((p) => normalizeRecipientFilter(p))
        : undefined;

    const clauses: Prisma.PaymentIntentWhereInput[] = [];

    if (recipientNorm) {
      clauses.push({ treasuryAddress: recipientNorm });
    }

    if (involvedNorm && involvedNorm.length > 0) {
      clauses.push({
        OR: involvedNorm.flatMap((w) => [{ treasuryAddress: w }, { payerAddress: w }]),
      });
    }

    if (clauses.length === 0) {
      return undefined;
    }
    if (clauses.length === 1) {
      return clauses[0];
    }
    return { AND: clauses };
  }

  async listPayments(
    search?: string,
    recipientRaw?: string,
    involvedRaw?: string,
  ): Promise<SerializedPaymentIntent[]> {
    const where = this.buildListWhere(recipientRaw, involvedRaw);

    const rows = await this.prisma.paymentIntent.findMany({
      where,
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

  async getPaymentMetrics(recipientRaw?: string, involvedRaw?: string): Promise<PaymentMetricsDto> {
    const scope = this.buildListWhere(recipientRaw, involvedRaw) ?? {};

    const [solAgg, splAgg, ethAgg, totalCount, successCount] = await Promise.all([
      this.prisma.paymentIntent.aggregate({
        where: {
          status: PaymentIntentStatus.SUCCESS,
          assetKind: AssetKind.NATIVE_SOL,
          ...scope,
        },
        _sum: { amount: true },
      }),
      this.prisma.paymentIntent.aggregate({
        where: {
          status: PaymentIntentStatus.SUCCESS,
          assetKind: AssetKind.SPL_TOKEN,
          ...scope,
        },
        _sum: { amount: true },
      }),
      this.prisma.paymentIntent.aggregate({
        where: {
          status: PaymentIntentStatus.SUCCESS,
          assetKind: AssetKind.EVM_NATIVE,
          ...scope,
        },
        _sum: { amount: true },
      }),
      this.prisma.paymentIntent.count({ where: scope }),
      this.prisma.paymentIntent.count({
        where: { status: PaymentIntentStatus.SUCCESS, ...scope },
      }),
    ]);

    const sumStr = (d: Prisma.Decimal | null | undefined): string =>
      d != null ? d.toString() : '0';

    return {
      totalVolumeSol: sumStr(solAgg._sum.amount),
      totalVolumeSpl: sumStr(splAgg._sum.amount),
      totalVolumeEth: sumStr(ethAgg._sum.amount),
      successCount,
      totalCount,
    };
  }

  /**
   * Verifies settlement on-chain (Solana or EVM) and updates the intent.
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

    let amountOk: boolean;
    let resolvedPayer: string | null = null;

    if (this.evm.isEvmIntent(intent)) {
      try {
        amountOk = await this.evm.verifyTransaction(signature, intent);
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        this.logger.error(`EVM verification failed for ${signature}: ${message}`);
        throw new ServiceUnavailableException(
          'Unable to verify the transaction on the EVM RPC. Retry later.',
        );
      }
      if (amountOk) {
        resolvedPayer = await this.evm.getPayerAddressFromTxHash(signature);
      }
    } else {
      let parsed;
      try {
        parsed = await this.solana.waitForFinalizedTransaction(signature);
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        this.logger.error(`Solana verification failed for ${signature}: ${message}`);
        throw new ServiceUnavailableException(
          'Unable to confirm the transaction on Solana. Retry later.',
        );
      }

      if (!parsed) {
        this.logger.warn(
          `Signature ${signature} not finalized within ${FINALIZE_TIMEOUT_MS}ms; intent left PENDING`,
        );
        throw new RequestTimeoutException(
          'Transaction was not finalized on Solana within the allowed window. No database changes were applied.',
        );
      }

      const chainError = parsed.meta?.err != null;
      amountOk = !chainError && (await this.solana.verifySettlement(parsed, intent));
      if (amountOk) {
        resolvedPayer = this.solana.extractFeePayerAddress(parsed);
      }
    }

    if (!amountOk) {
      this.logger.warn(`Verification rejected for ${signature}`);
      await this.markIntentFailed(intentId);
      const failed = await this.prisma.paymentIntent.findUniqueOrThrow({ where: { id: intentId } });
      const serializedFailed = this.serializeIntent(failed);
      this.webhooks.notifyIntentUpdated(failed, serializedFailed);
      return serializedFailed;
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
            ...(resolvedPayer ? { payerAddress: resolvedPayer } : {}),
          },
        });
      });

      this.logger.log(`Intent ${intentId} marked SUCCESS for signature ${signature}`);
      const serialized = this.serializeIntent(updated);
      this.webhooks.notifyIntentUpdated(updated, serialized);
      return serialized;
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
}
