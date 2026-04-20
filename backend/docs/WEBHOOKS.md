# Merchant webhooks

When a `Merchant` row has `webhookUrl` and `webhookSecret` set, K-INTENT sends an HTTP `POST` on terminal intent transitions (`SUCCESS` or `FAILED` after verification).

## Payload

- **Body:** JSON object  
  `{ "event": "payment_intent.updated", "id": "<uuid>", "status": "SUCCESS" | "FAILED", "data": { ...SerializedPaymentIntent } }`
- **Header `X-K-Intent-Signature`:** HMAC-SHA256 (hex) of the **raw** JSON body using `webhookSecret` as the key.
- **Header `X-K-Intent-Event`:** `payment_intent.updated`

## Verifying (merchant side)

1. Read the raw request body as a string (before JSON parsing, if your framework allows).
2. Compute `HMAC_SHA256(webhookSecret, body)` and compare (constant-time) to `X-K-Intent-Signature`.

Example (Node):

```typescript
import { createHmac, timingSafeEqual } from "crypto";

function verifyWebhook(body: string, secret: string, sigHeader: string): boolean {
  const expected = createHmac("sha256", secret).update(body).digest("hex");
  const a = Buffer.from(expected, "utf8");
  const b = Buffer.from(sigHeader, "utf8");
  return a.length === b.length && timingSafeEqual(a, b);
}
```

## Retry semantics

Delivery is **best-effort** (fire-and-forget from the API process). Failures are logged server-side; there is no automatic retry queue in this repository.

Recommended merchant behavior:

- Respond with `2xx` within a few seconds.
- Treat notifications as **at-least-once**: use intent `id` and `status` to make your handler idempotent.
- For reconciliation, poll `GET /payments` or use your own job queue fed by the webhook.

## Configuring webhooks

Update the `Merchant` row (e.g. Prisma Studio, SQL, or your admin tooling):

```sql
UPDATE "Merchant"
SET "webhookUrl" = 'https://example.com/hooks/k-intent',
    "webhookSecret" = 'use-a-long-random-secret'
WHERE id = 'k-intent-demo';
```
