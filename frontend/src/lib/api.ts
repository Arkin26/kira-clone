import { API_BASE_URL } from "./constants";
import type { PaymentMetrics, SerializedPaymentIntent } from "@/types/payment";

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
}): Promise<SerializedPaymentIntent> {
  const res = await fetch(`${API_BASE_URL}/payments/intent`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
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

export async function fetchPayments(q?: string): Promise<SerializedPaymentIntent[]> {
  const params = new URLSearchParams();
  if (q?.trim()) params.set("q", q.trim());
  const qs = params.toString();
  const res = await fetch(`${API_BASE_URL}/payments${qs ? `?${qs}` : ""}`);
  if (!res.ok) throw new Error(await parseErrorMessage(res));
  return res.json() as Promise<SerializedPaymentIntent[]>;
}

export async function fetchPaymentMetrics(): Promise<PaymentMetrics> {
  const res = await fetch(`${API_BASE_URL}/payments/metrics`);
  if (!res.ok) throw new Error(await parseErrorMessage(res));
  return res.json() as Promise<PaymentMetrics>;
}
