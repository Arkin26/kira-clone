import { API_BASE_URL, API_KEY } from "./constants";
import type { PaymentMetrics, SerializedPaymentIntent } from "@/types/payment";

function debugLog(
  runId: string,
  hypothesisId: string,
  location: string,
  message: string,
  data: Record<string, unknown>,
): void {
  // #region agent log
  fetch("http://127.0.0.1:7784/ingest/028dba60-64b1-4274-9067-3a7dd7d92fbe", {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Debug-Session-Id": "c469d4" },
    body: JSON.stringify({
      sessionId: "c469d4",
      runId,
      hypothesisId,
      location,
      message,
      data,
      timestamp: Date.now(),
    }),
  }).catch(() => {});
  // #endregion
}

function headersJson(): HeadersInit {
  const h: Record<string, string> = { "Content-Type": "application/json" };
  if (API_KEY.trim()) {
    h["X-API-Key"] = API_KEY.trim();
  }
  return h;
}

function requireApiBaseUrl(): string {
  if (!API_BASE_URL) {
    throw new Error(
      "Frontend is missing NEXT_PUBLIC_API_URL in production environment configuration.",
    );
  }
  return API_BASE_URL;
}

async function parseErrorMessage(res: Response): Promise<string> {
  const text = await res.text();
  try {
    const json = JSON.parse(text) as { message?: string | string[] };
    if (Array.isArray(json.message)) return json.message.join(", ");
    if (typeof json.message === "string") return json.message;
  } catch {
    /* ignore */
  }
  return text || res.statusText;
}

export async function createPaymentIntent(body: {
  merchantId: string;
  amount: number;
  chainId?: string;
  assetKind?: string;
  mintAddress?: string;
  /** Solana base58 or EVM `0x…`; omit to use server default treasury. */
  treasuryAddress?: string;
}): Promise<SerializedPaymentIntent> {
  const apiBaseUrl = requireApiBaseUrl();
  const requestUrl = `${apiBaseUrl}/payments/intent`;
  debugLog("pre-fix", "H1-H2", "frontend/src/lib/api.ts:58", "createPaymentIntent request start", {
    apiBaseUrl,
    requestUrl,
    merchantId: body.merchantId,
    chainId: body.chainId ?? null,
    assetKind: body.assetKind ?? null,
  });

  const res = await fetch(requestUrl, {
    method: "POST",
    headers: headersJson(),
    body: JSON.stringify(body),
  });
  debugLog("pre-fix", "H3-H4", "frontend/src/lib/api.ts:71", "createPaymentIntent response", {
    apiBaseUrl,
    requestUrl,
    ok: res.ok,
    status: res.status,
  });
  if (!res.ok) throw new Error(await parseErrorMessage(res));
  return res.json() as Promise<SerializedPaymentIntent>;
}

export async function verifyPayment(body: {
  signature: string;
  intentId: string;
}): Promise<SerializedPaymentIntent> {
  const res = await fetch(`${requireApiBaseUrl()}/payments/verify`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(await parseErrorMessage(res));
  return res.json() as Promise<SerializedPaymentIntent>;
}

export async function fetchPayments(
  q?: string,
  recipient?: string,
  involved?: string,
): Promise<SerializedPaymentIntent[]> {
  const params = new URLSearchParams();
  if (q?.trim()) params.set("q", q.trim());
  if (recipient?.trim()) params.set("recipient", recipient.trim());
  if (involved?.trim()) params.set("involved", involved.trim());
  const qs = params.toString();
  const res = await fetch(`${requireApiBaseUrl()}/payments${qs ? `?${qs}` : ""}`);
  if (!res.ok) throw new Error(await parseErrorMessage(res));
  return res.json() as Promise<SerializedPaymentIntent[]>;
}

/** Privy access token (Bearer) for `/auth/*` routes — call from the client after `getAccessToken()`. */
export async function fetchAuthMe(accessToken: string): Promise<{
  userId: string;
  merchantId: string | null;
}> {
  const res = await fetch(`${requireApiBaseUrl()}/auth/me`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) throw new Error(await parseErrorMessage(res));
  return res.json() as Promise<{ userId: string; merchantId: string | null }>;
}

export async function bindMerchantToPrivyUser(
  accessToken: string,
  merchantId: string,
): Promise<{ ok: boolean; merchantId?: string; error?: string }> {
  const res = await fetch(`${requireApiBaseUrl()}/auth/bind-merchant`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({ merchantId }),
  });
  if (!res.ok) throw new Error(await parseErrorMessage(res));
  return res.json() as Promise<{ ok: boolean; merchantId?: string; error?: string }>;
}

export async function fetchPaymentMetrics(recipient?: string, involved?: string): Promise<PaymentMetrics> {
  const params = new URLSearchParams();
  if (recipient?.trim()) params.set("recipient", recipient.trim());
  if (involved?.trim()) params.set("involved", involved.trim());
  const qs = params.toString();
  const res = await fetch(`${requireApiBaseUrl()}/payments/metrics${qs ? `?${qs}` : ""}`);
  if (!res.ok) throw new Error(await parseErrorMessage(res));
  return res.json() as Promise<PaymentMetrics>;
}
