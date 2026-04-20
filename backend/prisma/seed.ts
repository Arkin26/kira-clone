import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/** Devnet USDC (Circle test mint) — same default as frontend `DEVNET_USDC_MINT`. */
const SOLANA_DEVNET_USDC = '4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU';

async function main(): Promise<void> {
  await prisma.merchant.upsert({
    where: { id: 'k-intent-demo' },
    create: { id: 'k-intent-demo' },
    update: {},
  });

  await prisma.merchantAssetAllowlist.upsert({
    where: {
      merchantId_chainId_mint: {
        merchantId: 'k-intent-demo',
        chainId: 'solana:devnet',
        mint: SOLANA_DEVNET_USDC,
      },
    },
    create: {
      merchantId: 'k-intent-demo',
      chainId: 'solana:devnet',
      mint: SOLANA_DEVNET_USDC,
      decimals: 6,
      symbol: 'USDC',
    },
    update: {
      decimals: 6,
      symbol: 'USDC',
    },
  });

  // Example Sepolia ERC-20 allowlist entry (replace with a real test token for your stack).
  const sepoliaUsdc =
    process.env.SEED_SEPOLIA_ERC20_MINT ?? '0x0000000000000000000000000000000000000000';
  if (sepoliaUsdc !== '0x0000000000000000000000000000000000000000') {
    await prisma.merchantAssetAllowlist.upsert({
      where: {
        merchantId_chainId_mint: {
          merchantId: 'k-intent-demo',
          chainId: 'eip155:11155111',
          mint: sepoliaUsdc.toLowerCase(),
        },
      },
      create: {
        merchantId: 'k-intent-demo',
        chainId: 'eip155:11155111',
        mint: sepoliaUsdc.toLowerCase(),
        decimals: 6,
        symbol: 'USDC',
      },
      update: {},
    });
  }
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
