import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AssetKind, PaymentIntent } from '@prisma/client';
import { ethers } from 'ethers';
import { PrismaService } from '../prisma/prisma.service';

const ERC20_IFACE = new ethers.Interface([
  'event Transfer(address indexed from, address indexed to, uint256 value)',
]);

/**
 * Verifies EVM transactions (native ETH and ERC-20) on the RPC chain configured by EVM_RPC_URL.
 */
@Injectable()
export class EvmSettlementService {
  private readonly logger = new Logger(EvmSettlementService.name);

  constructor(
    private readonly config: ConfigService,
    private readonly prisma: PrismaService,
  ) {}

  isEvmIntent(intent: PaymentIntent): boolean {
    return intent.chainId.startsWith('eip155:');
  }

  async getPayerAddressFromTxHash(txHash: string): Promise<string | null> {
    const rpc = this.config.get<string>('EVM_RPC_URL');
    if (!rpc?.trim()) {
      return null;
    }
    const provider = new ethers.JsonRpcProvider(rpc);
    const tx = await provider.getTransaction(txHash);
    return tx?.from?.toLowerCase() ?? null;
  }

  async verifyTransaction(txHash: string, intent: PaymentIntent): Promise<boolean> {
    const rpc = this.config.get<string>('EVM_RPC_URL');
    if (!rpc?.trim()) {
      this.logger.error('EVM_RPC_URL is not set');
      return false;
    }

    const provider = new ethers.JsonRpcProvider(rpc);
    const receipt = await provider.getTransactionReceipt(txHash);
    if (!receipt || receipt.status !== 1) {
      this.logger.warn(`EVM receipt missing or reverted for ${txHash}`);
      return false;
    }

    const tx = await provider.getTransaction(txHash);
    if (!tx) {
      return false;
    }

    const expectedChain = intent.evmChainId;
    const network = await provider.getNetwork();
    if (expectedChain != null && Number(network.chainId) !== expectedChain) {
      this.logger.warn(`Chain mismatch: intent ${expectedChain}, rpc ${network.chainId}`);
      return false;
    }

    const treasury = intent.treasuryAddress.toLowerCase();

    if (intent.assetKind === AssetKind.EVM_NATIVE) {
      return this.verifyNativeEth(tx, intent, treasury);
    }
    if (intent.assetKind === AssetKind.EVM_ERC20) {
      return this.verifyErc20(receipt, intent, treasury);
    }
    return false;
  }

  private verifyNativeEth(
    tx: ethers.TransactionResponse,
    intent: PaymentIntent,
    treasuryLower: string,
  ): boolean {
    if (tx.to?.toLowerCase() !== treasuryLower) {
      this.logger.warn(`EVM native: tx.to ${tx.to} !== treasury ${treasuryLower}`);
      return false;
    }
    const requiredWei = ethers.parseUnits(intent.amount.toString(), 18);
    if (tx.value < requiredWei) {
      this.logger.warn(`EVM native: value ${tx.value} < required ${requiredWei}`);
      return false;
    }
    return true;
  }

  private async verifyErc20(
    receipt: ethers.TransactionReceipt,
    intent: PaymentIntent,
    treasuryLower: string,
  ): Promise<boolean> {
    const contract = intent.mintAddress?.toLowerCase();
    if (!contract) {
      return false;
    }

    const row = await this.prisma.merchantAssetAllowlist.findUnique({
      where: {
        merchantId_chainId_mint: {
          merchantId: intent.merchantId,
          chainId: intent.chainId,
          mint: contract,
        },
      },
    });
    const decimals = row?.decimals ?? 18;
    const required = ethers.parseUnits(intent.amount.toString(), decimals);

    for (const log of receipt.logs) {
      if (log.address.toLowerCase() !== contract) continue;
      try {
        const parsed = ERC20_IFACE.parseLog({
          topics: log.topics as string[],
          data: log.data,
        });
        if (parsed?.name !== 'Transfer') continue;
        const to = (parsed.args.to as string).toLowerCase();
        if (to !== treasuryLower) continue;
        const value = parsed.args.value as bigint;
        if (value >= required) {
          return true;
        }
      } catch {
        /* not a Transfer from this contract */
      }
    }

    this.logger.warn('ERC-20 Transfer to treasury not found or amount too low');
    return false;
  }
}
