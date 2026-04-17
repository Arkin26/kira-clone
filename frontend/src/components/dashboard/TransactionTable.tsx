"use client";

import { ExternalLink } from "lucide-react";
import { useState } from "react";

import { solscanTxUrl } from "@/lib/constants";
import { formatIntentTimestamp } from "@/lib/format-time";
import type { PaymentIntentStatus, SerializedPaymentIntent } from "@/types/payment";

function truncateId(id: string): string {
  if (id.length <= 14) return id;
  return `${id.slice(0, 8)}…${id.slice(-6)}`;
}

function StatusBadge({ status }: { status: PaymentIntentStatus }) {
  const base =
    "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold tracking-wide";
  if (status === "SUCCESS") {
    return (
      <span
        className={`${base} border border-emerald-500/35 bg-emerald-500/10 text-emerald-300 shadow-[0_0_14px_rgba(52,211,153,0.25)]`}
      >
        SUCCESS
      </span>
    );
  }
  if (status === "PENDING") {
    return (
      <span className={`${base} border border-white/[0.08] bg-white/[0.04] text-white/45`}>
        PENDING
      </span>
    );
  }
  return (
    <span
      className={`${base} border border-red-500/35 bg-red-500/10 text-red-300 shadow-[0_0_12px_rgba(248,113,113,0.2)]`}
    >
      FAILED
    </span>
  );
}

function CopyIntentId({ id }: { id: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      onClick={async () => {
        await navigator.clipboard.writeText(id);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }}
      className="group flex items-center gap-2 text-left font-mono text-xs text-white/85 transition hover:text-[#B2C8BC]"
      title="Copy full intent ID"
    >
      <span>{truncateId(id)}</span>
      <span className="text-[10px] uppercase tracking-wider text-white/35 group-hover:text-[#B2C8BC]">
        {copied ? "Copied" : "Copy"}
      </span>
    </button>
  );
}

function AmountCell({ row }: { row: SerializedPaymentIntent }) {
  return (
    <div className="flex items-center gap-2">
      <span className="rounded-md border border-white/[0.08] bg-white/[0.04] px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide text-[#84A794]">
        SOL
      </span>
      <span className="font-mulish tabular-nums text-sm text-white/90">{row.amount}</span>
      <span className="text-white/25">→</span>
      <span className="rounded-md border border-[#B2C8BC]/20 bg-[#B2C8BC]/5 px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide text-[#B2C8BC]">
        USDC
      </span>
    </div>
  );
}

type Props = {
  rows: SerializedPaymentIntent[];
};

export function TransactionTable({ rows }: Props) {
  if (rows.length === 0) {
    return (
      <div className="px-5 py-12 text-center text-sm text-white/40">
        No transactions yet. Complete a checkout on the home page to see intents here.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[860px] border-collapse text-left text-sm">
        <thead>
          <tr className="border-b border-white/[0.08] text-xs font-medium uppercase tracking-wider text-white/40">
            <th className="px-4 py-3 sm:px-5">Intent</th>
            <th className="px-4 py-3 sm:px-5">Amount</th>
            <th className="px-4 py-3 sm:px-5">Status</th>
            <th className="px-4 py-3 sm:px-5">Time</th>
            <th className="px-4 py-3 sm:px-5">Explorer</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-white/[0.06]">
          {rows.map((row) => (
            <tr key={row.id} className="transition hover:bg-white/[0.02]">
              <td className="px-4 py-3.5 sm:px-5">
                <CopyIntentId id={row.id} />
              </td>
              <td className="px-4 py-3.5 sm:px-5">
                <AmountCell row={row} />
              </td>
              <td className="px-4 py-3.5 sm:px-5">
                <StatusBadge status={row.status} />
              </td>
              <td className="whitespace-nowrap px-4 py-3.5 text-white/55 sm:px-5">
                {formatIntentTimestamp(row.createdAt)}
              </td>
              <td className="px-4 py-3.5 sm:px-5">
                {row.signature ? (
                  <a
                    href={solscanTxUrl(row.signature)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-medium text-[#B2C8BC] transition hover:text-white"
                  >
                    Solscan
                    <ExternalLink className="h-3.5 w-3.5 opacity-70" strokeWidth={1.75} />
                  </a>
                ) : (
                  <span className="text-xs text-white/25">—</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
