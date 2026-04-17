# K-INTENT

K-INTENT is a non-custodial, intent-based payment gateway built on Solana.

The core idea is simple: instead of trusting a backend to move funds, the backend only records payment intent state and verifies what happened on-chain. The user signs the transaction in their own wallet, and K-INTENT confirms the transaction before marking payment success.

## What the project does

K-INTENT provides two main experiences:

- A checkout flow where a payer enters an amount, signs a SOL transfer, and receives payment confirmation.
- A merchant dashboard where operators track volume, payment statuses, transaction history, and export reports.

The platform is designed for portfolio-quality UX (glassmorphism UI, responsive layouts, polished loading and success states) while keeping backend logic explicit and auditable.

## Core logic used in K-INTENT

### 1) Intent-first payment model

Before any on-chain transfer, the frontend asks the backend to create a `PaymentIntent` with status `PENDING`.

This gives the system:

- A stable intent ID for later verification.
- A server-side record for analytics and reconciliation.
- A state machine for payment lifecycle (`PENDING` -> `SUCCESS` or `FAILED`).

### 2) Non-custodial signing

The frontend uses Solana Wallet Adapter to request signing/sending from the payer wallet.

- Private keys never touch the backend.
- The backend cannot create or sign user transactions.
- The wallet returns a transaction signature used for verification.

### 3) Backend verification pipeline

When the frontend sends `{ intentId, signature }` to `POST /payments/verify`, backend logic:

1. Finds the intent by ID.
2. Enforces idempotency rules (signature cannot be reused across intents).
3. Waits for on-chain finalization (`finalized` commitment).
4. Fetches parsed transaction data from Solana RPC.
5. Checks transaction outcome and amount match against the intent.
6. Updates DB status to `SUCCESS` (or `FAILED` when verification fails).

This separates UI optimism from final truth: success is only recorded after chain verification.

### 4) Security controls

- DTO validation with global `ValidationPipe`.
- Amount validation (`amount > 0`) in both DTO and service guard logic.
- Rate limiting on `POST /payments/verify` (5 requests/minute per IP) to reduce RPC abuse.
- Unique transaction signature constraints to prevent replay/duplicate settlement.

## What happens in the backend (NestJS + Prisma)

The backend is organized around a `Payments` module and Prisma data access:

- `POST /payments/intent`: creates a pending intent row.
- `POST /payments/verify`: rate-limited verification endpoint.
- `GET /payments`: returns transaction feed (supports search).
- `GET /payments/metrics`: returns dashboard aggregates (e.g., total successful volume).

Database model highlights:

- `PaymentIntent` stores merchant ID, amount, currency, status, optional signature, timestamps.
- Aggregations for dashboard metrics are computed directly from persisted intent states.
- Prisma handles typed DB access; Supabase/Postgres acts as source of record.

## Frontend + dashboard behavior

The frontend (Next.js 14) coordinates user flows with React Query:

- Checkout calls intent -> wallet send -> verify.
- Dashboard polls/fetches metrics and transactions.
- Search, manual refresh, skeleton loading, and CSV export support merchant operations.

Statuses are rendered with clear UI semantics:

- `SUCCESS` (green/glow badge)
- `PENDING` (muted neutral)
- `FAILED` (red)

Each verified signature can be opened in Solscan for external auditability.

## Local run (quick)

1. Configure backend env in `backend/.env` (`DATABASE_URL`, `RPC_URL`).
2. Configure frontend env in `frontend/.env.local` (`NEXT_PUBLIC_*` variables).
3. Run backend:
   ```bash
   cd backend
   npm install
   npm run prisma:generate
   npm run start:dev
   ```
4. Run frontend:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

App routes:

- Landing/checkout: `http://localhost:3001/`
- Merchant dashboard: `http://localhost:3001/dashboard`
# kira-clone
