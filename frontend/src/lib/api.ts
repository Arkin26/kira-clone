import { API_BASE_URL, API_KEY } from "./constants";
import type { PaymentMetrics, SerializedPaymentIntent } from "@/types/payment";

function headersJson(): HeadersInit {
  const h: Record<string, string> = { "Content-Type": "application/json" };
  if (API_KEY.trim()) {
    h["X-API-Key"] = API_KEY.trim();
  }
  return h;
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
  const res = await fetch(`${API_BASE_URL}/payments/intent`, {
    method: "POST",
    headers: headersJson(),
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(await parseErrorMessage(res));
  return res.json() as Promise<SerializedPaymentIntent>;
}

export async function verifyPayment(body: {
  signature: string;
  intentId: string;
}): Promise<SerializedPaymentIntent> {
  const res = await fetch(`${API_BASE_URL}/payments/verify`, {
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
  const res = await fetch(`${API_BASE_URL}/payments${qs ? `?${qs}` : ""}`);
  if (!res.ok) throw new Error(await parseErrorMessage(res));
  return res.json() as Promise<SerializedPaymentIntent[]>;
}

/** Privy access token (Bearer) for `/auth/*` routes — call from the client after `getAccessToken()`. */
export async function fetchAuthMe(accessToken: string): Promise<{
  userId: string;
  merchantId: string | null;
}> {
  const res = await fetch(`${API_BASE_URL}/auth/me`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) throw new Error(await parseErrorMessage(res));
  return res.json() as Promise<{ userId: string; merchantId: string | null }>;
}

export async function bindMerchantToPrivyUser(
  accessToken: string,
  merchantId: string,
): Promise<{ ok: boolean; merchantId?: string; error?: string }> {
  const res = await fetch(`${API_BASE_URL}/auth/bind-merchant`, {
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
  const res = await fetch(`${API_BASE_URL}/payments/metrics${qs ? `?${qs}` : ""}`);
  if (!res.ok) throw new Error(await parseErrorMessage(res));
  return res.json() as Promise<PaymentMetrics>;
}
