import { AssetKind } from '@prisma/client';
import { Type } from 'class-transformer';
import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsPositive, IsString } from 'class-validator';

export class CreatePaymentIntentDto {
  @IsString()
  @IsNotEmpty()
  merchantId!: string;

  /** Must be strictly greater than zero. */
  @IsNumber()
  @IsPositive()
  @Type(() => Number)
  amount!: number;

  /** Defaults to `solana:devnet`. Use `eip155:11155111` for EVM (Sepolia). */
  @IsOptional()
  @IsString()
  chainId?: string;

  /**
   * Defaults: `NATIVE_SOL` on Solana, `EVM_NATIVE` on EIP-155 chains.
   * Use `SPL_TOKEN` / `EVM_ERC20` with `mintAddress`.
   */
  @IsOptional()
  @IsEnum(AssetKind)
  assetKind?: AssetKind;

  /** Required for SPL_TOKEN and EVM_ERC20. */
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  mintAddress?: string;

  /**
   * Recipient treasury address (Solana base58 or `0x…` on EVM).
   * If omitted, server uses `TREASURY_PUBLIC_KEY` (Solana) or `EVM_TREASURY_ADDRESS` (EIP-155).
   */
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  treasuryAddress?: string;
}
