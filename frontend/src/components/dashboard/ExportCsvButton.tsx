"use client";

import { Download } from "lucide-react";

import type { SerializedPaymentIntent } from "@/types/payment";

function escapeCsvCell(value: string): string {
  if (value.includes('"') || value.includes(",") || value.includes("\n")) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

function buildCsv(rows: SerializedPaymentIntent[]): string {
  const header = [
    "intent_id",
    "merchant_id",
    "amount",
    "currency",
    "status",
    "signature",
    "created_at",
    "updated_at",
  ];
  const lines = [header.join(",")];
  for (const r of rows) {
    lines.push(
      [
        escapeCsvCell(r.id),
        escapeCsvCell(r.merchantId),
        escapeCsvCell(r.amount),
        escapeCsvCell(r.currency),
        escapeCsvCell(r.status),
        escapeCsvCell(r.signature ?? ""),
        escapeCsvCell(r.createdAt),
        escapeCsvCell(r.updatedAt),
      ].join(","),
    );
  }
  return lines.join("\n");
}

type Props = {
  rows: SerializedPaymentIntent[];
  disabled?: boolean;
};

export function ExportCsvButton({ rows, disabled }: Props) {
  return (
    <button
      type="button"
      disabled={disabled || rows.length === 0}
      onClick={() => {
        const csv = buildCsv(rows);
        const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `k-intent-payments-${new Date().toISOString().slice(0, 10)}.csv`;
        a.click();
        URL.revokeObjectURL(url);
      }}
      className="inline-flex items-center gap-2 rounded-xl border border-white/[0.1] bg-white/[0.04] px-3 py-2 text-xs font-medium text-white/80 transition hover:border-[#B2C8BC]/30 hover:bg-white/[0.07] hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
    >
      <Download className="h-3.5 w-3.5" strokeWidth={1.75} />
      Export CSV
    </button>
  );
}
