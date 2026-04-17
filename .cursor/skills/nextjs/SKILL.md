# Next.js Skill — K-INTENT Frontend
# =========================================
# DROP THIS FILE AT: .cursor/skills/nextjs/SKILL.md
# USAGE: Type @.cursor/skills/nextjs/SKILL.md in Cursor chat when working on frontend
# =========================================

## What This Skill Covers
Next.js 14 App Router conventions, component structure, wallet integration,
API communication patterns, and the K-INTENT design system implementation.

---

## Project Structure (Frontend)

```
frontend/
  src/
    app/
      layout.tsx              ← Root layout: fonts, providers, metadata
      page.tsx                ← Home/landing page
      globals.css             ← Tailwind directives + CSS variables
    components/
      ui/                     ← Primitives: Button, Card, Badge, Input
      sections/               ← Page sections: Hero, Features, Checkout, Footer
      providers/
        WalletProvider.tsx    ← Solana wallet adapter wrapper (client component)
        QueryProvider.tsx     ← React Query wrapper (if used)
    lib/
      api.ts                  ← All fetch calls to the NestJS backend
      solana.ts               ← Transaction building (NOT signing — that's in components)
      utils.ts                ← cn() helper, formatters, etc.
    hooks/
      usePaymentFlow.ts       ← Custom hook: intent creation → tx → verify → success
      useIntentStatus.ts      ← Polling hook for intent status
    types/
      index.ts                ← Shared TypeScript types
```

---

## Root Layout (app/layout.tsx)

```typescript
import type { Metadata } from 'next';
import { Mulish } from 'next/font/google';
import { WalletProvider } from '@/components/providers/WalletProvider';
import './globals.css';

const mulish = Mulish({
  subsets: ['latin'],
  weight: ['200', '300', '400', '500', '600', '700'],
  variable: '--font-mulish',
});

export const metadata: Metadata = {
  title: 'K-INTENT | Intent-Based Payments on Solana',
  description: 'Non-custodial payment gateway powered by Solana',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={mulish.variable}>
      <body className="bg-[#020202] text-white font-mulish antialiased">
        <WalletProvider>
          {children}
        </WalletProvider>
      </body>
    </html>
  );
}
```

---

## Global CSS (globals.css)

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  --bg-primary: #020202;
  --accent-sage: #B2C8BC;
  --accent-forest: #84A794;
  --text-primary: #FFFFFF;
  --text-muted: #B2C2C3;
  --glass-bg: rgba(255, 255, 255, 0.03);
  --glass-border: rgba(255, 255, 255, 0.08);
}

/* Glass card utility */
@layer components {
  .glass-card {
    @apply backdrop-blur-md border rounded-2xl;
    background: var(--glass-bg);
    border-color: var(--glass-border);
  }

  /* Eclipse glow — used in hero */
  .eclipse-glow {
    background: radial-gradient(
      ellipse 60% 40% at 50% 0%,
      rgba(132, 167, 148, 0.15) 0%,
      transparent 70%
    );
  }

  /* Glow arc — thin semi-circle */
  .glow-arc {
    border-top: 1px solid rgba(178, 200, 188, 0.3);
    border-radius: 50%;
    box-shadow: 0 -2px 20px rgba(178, 200, 188, 0.15);
  }
}
```

---

## Wallet Provider (Client Component)

```typescript
// components/providers/WalletProvider.tsx
'use client';

import { FC, ReactNode, useMemo } from 'react';
import { ConnectionProvider, WalletProvider as SolanaWalletProvider } from '@solana/wallet-adapter-react';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import { PhantomWalletAdapter } from '@solana/wallet-adapter-wallets';

// Required CSS for the wallet modal
import '@solana/wallet-adapter-react-ui/styles.css';

interface Props { children: ReactNode }

export const WalletProvider: FC<Props> = ({ children }) => {
  const endpoint = process.env.NEXT_PUBLIC_SOLANA_RPC ?? 'https://api.devnet.solana.com';
  const wallets = useMemo(() => [new PhantomWalletAdapter()], []);

  return (
    <ConnectionProvider endpoint={endpoint}>
      <SolanaWalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>
          {children}
        </WalletModalProvider>
      </SolanaWalletProvider>
    </ConnectionProvider>
  );
};
```

---

## API Layer (lib/api.ts)

```typescript
// lib/api.ts
const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api';

export interface PaymentIntent {
  id: string;
  merchantId: string;
  amount: number;
  currency: string;
  targetCurrency: string;
  status: 'PENDING' | 'SUCCESS' | 'FAILED';
  signature: string | null;
  createdAt: string;
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });

  const json = await res.json();
  if (!json.success) throw new Error(json.message ?? 'API Error');
  return json.data as T;
}

export const api = {
  createIntent: (body: { merchantId: string; amount: number; currency: string; targetCurrency: string }) =>
    request<PaymentIntent>('/intent', { method: 'POST', body: JSON.stringify(body) }),

  getIntent: (id: string) =>
    request<PaymentIntent>(`/intent/${id}`),

  verifyIntent: (id: string, signature: string) =>
    request<PaymentIntent>(`/intent/${id}/verify`, {
      method: 'POST',
      body: JSON.stringify({ signature }),
    }),
};
```

---

## Payment Flow Hook

```typescript
// hooks/usePaymentFlow.ts
'use client';

import { useState } from 'react';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { api } from '@/lib/api';
import { sendSolPayment } from '@/lib/solana';

type FlowStatus = 'idle' | 'creating' | 'signing' | 'verifying' | 'success' | 'error';

export function usePaymentFlow() {
  const [status, setStatus] = useState<FlowStatus>('idle');
  const [intentId, setIntentId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const { publicKey, sendTransaction } = useWallet();
  const { connection } = useConnection();

  const initiatePayment = async (amountSol: number) => {
    if (!publicKey) { setError('Please connect your wallet'); return; }

    try {
      // Step 1: Create intent
      setStatus('creating');
      const intent = await api.createIntent({
        merchantId: 'demo-merchant',
        amount: amountSol,
        currency: 'SOL',
        targetCurrency: 'USDC',
      });
      setIntentId(intent.id);

      // Step 2: Sign & send transaction
      setStatus('signing');
      const signature = await sendSolPayment(publicKey, sendTransaction, amountSol);

      // Step 3: Backend verifies on-chain
      setStatus('verifying');
      await api.verifyIntent(intent.id, signature);

      setStatus('success');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Payment failed');
      setStatus('error');
    }
  };

  return { status, intentId, error, initiatePayment };
}
```

---

## Design System Tokens (Tailwind Config)

```typescript
// tailwind.config.ts
import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        sage: '#B2C8BC',
        forest: '#84A794',
        muted: '#B2C2C3',
      },
      fontFamily: {
        mulish: ['var(--font-mulish)', 'sans-serif'],
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [],
};

export default config;
```

---

## Component Rules

- `"use client"` ONLY when needed: wallet hooks, useState, useEffect, onClick
- Server components for: layouts, data fetching, static sections
- Never use `useEffect` for data fetching — use React Query or server components
- Glass card: always use `.glass-card` class or `backdrop-blur-md bg-white/[0.03] border border-white/[0.08]`
- Animations: Framer Motion for page-level, CSS transitions for hover states

---

## Frontend Environment Variables

```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api
NEXT_PUBLIC_SOLANA_RPC=https://api.devnet.solana.com
NEXT_PUBLIC_MERCHANT_WALLET=your_devnet_wallet_address_here
```

---

## Required Packages

```bash
npm install @solana/wallet-adapter-react @solana/wallet-adapter-react-ui
npm install @solana/wallet-adapter-wallets @solana/wallet-adapter-base
npm install @solana/web3.js
npm install framer-motion
npm install lucide-react
npm install clsx tailwind-merge
```