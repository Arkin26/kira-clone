import { Sparkles } from "lucide-react";

import type { PaymentMetrics } from "@/types/payment";

type Props = {
  metrics: PaymentMetrics | undefined;
  planName?: string;
  /** Soft cap for usage bar (e.g. monthly intent quota). */
  usageCap?: number;
};

export function PlanStatusCard({
  metrics,
  planName = "Growth",
  usageCap = 1000,
}: Props) {
  const used = metrics?.totalCount ?? 0;
  const pct = Math.min(100, usageCap > 0 ? (used / usageCap) * 100 : 0);

  return (
    <div className="rounded-2xl border border-white/[0.08] bg-white/[0.05] p-6 shadow-[0_0_0_1px_rgba(255,255,255,0.04)] backdrop-blur-[12px]">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-white/45">Plan status</p>
          <p className="mt-2 font-mulish text-lg font-semibold text-white">Current plan</p>
          <p className="text-sm font-medium text-[#B2C8BC]">{planName}</p>
        </div>
        <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-[#B2C8BC]/25 bg-[#B2C8BC]/10 text-[#B2C8BC] shadow-[0_0_18px_rgba(178,200,188,0.18)]">
          <Sparkles className="h-5 w-5" strokeWidth={1.75} />
        </div>
      </div>
      <div className="mt-6">
        <div className="flex items-center justify-between text-xs text-white/50">
          <span>Usage</span>
          <span>
            {used.toLocaleString()} / {usageCap.toLocaleString()} intents
          </span>
        </div>
        <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/[0.06]">
          <div
            className="h-full rounded-full bg-gradient-to-r from-[#84A794] to-[#B2C8BC] shadow-[0_0_12px_rgba(178,200,188,0.35)] transition-all duration-500"
            style={{ width: `${pct}%` }}
          />
        </div>
        <p className="mt-3 text-xs text-white/35">
          {metrics?.successCount ?? 0} successful settlements · {metrics?.totalVolumeSol ?? "0"} SOL
          volume
        </p>
      </div>
    </div>
  );
}
