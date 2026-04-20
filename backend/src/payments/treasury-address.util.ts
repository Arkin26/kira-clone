import { BadRequestException } from '@nestjs/common';
import { PublicKey } from '@solana/web3.js';
import { ethers } from 'ethers';

/**
 * Canonical form for DB + filters: Solana base58 (via PublicKey), EVM checksummed lowercase for stable matching.
 */
export function normalizeTreasuryAddress(chainId: string, raw: string): string {
  const trimmed = raw.trim();
  if (!trimmed) {
    throw new BadRequestException('treasuryAddress cannot be empty');
  }
  if (chainId.startsWith('eip155:')) {
    if (!ethers.isAddress(trimmed)) {
      throw new BadRequestException('Invalid EVM treasury address');
    }
    return trimmed.toLowerCase();
  }
  try {
    return new PublicKey(trimmed).toBase58();
  } catch {
    throw new BadRequestException('Invalid Solana treasury address');
  }
}

/**
 * For `?recipient=` filters: infer Solana (base58) vs EVM (`0x…`) from the string shape.
 */
export function normalizeRecipientFilter(raw: string): string {
  const trimmed = raw.trim();
  if (!trimmed) {
    throw new BadRequestException('recipient query cannot be empty');
  }
  if (trimmed.startsWith('0x')) {
    if (!ethers.isAddress(trimmed)) {
      throw new BadRequestException('Invalid recipient filter (EVM address)');
    }
    return trimmed.toLowerCase();
  }
  try {
    return new PublicKey(trimmed).toBase58();
  } catch {
    throw new BadRequestException('Invalid recipient filter (Solana address)');
  }
}
