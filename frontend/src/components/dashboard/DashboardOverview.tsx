"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { RefreshCw, TrendingUp } from "lucide-react";
import { useSearchParams } from "next/navigation";

import { fetchPaymentMetrics } from "@/lib/api";
import { useInvolvedWalletAddresses } from "@/hooks/useInvolvedWalletAddresses";

import { PlanStatusCard } from "./PlanStatusCard";
import { RecipientFilter } from "./RecipientFilter";
import { StatCard } from "./StatCard";
import { TransactionFeedPanel, useDebouncedSearch } from "./TransactionFeedPanel";

export function DashboardOverview() {
  const queryClient = useQueryClient();
  const searchParams = useSearchParams();
  const recipient = searchParams.get("recipient")?.trim() || undefined;
  const { debounced, searchBar } = useDebouncedSearch();
  const involvedWallets = useInvolvedWalletAddresses();
  const involvedParam =
    involvedWallets.length > 0 ? involvedWallets.join(",") : undefined;

  const {
    data: metrics,
    isLoading: metricsLoading,
    isFetching: metricsFetching,
  } = useQuery({
    queryKey: ["payment-metrics", recipient ?? "", involvedParam ?? ""],
    queryFn: () => fetchPaymentMetrics(recipient, involvedParam),
  });

  const refreshing = metricsFetching;

  const handleRefreshAll = () => {
    void queryClient.invalidateQueries({ queryKey: ["payments"] });
    void queryClient.invalidateQueries({ queryKey: ["payment-metrics"] });
  };

  const volumeDisplay = metricsLoading
    ? "…"
    : [
        `${formatSol(metrics?.totalVolumeSol ?? "0")} SOL`,
        `${formatSol(metrics?.totalVolumeSpl ?? "0")} SPL`,
        `${formatSol(metrics?.totalVolumeEth ?? "0")} ETH`,
      ].join(" · ");

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-mulish text-2xl font-semibold tracking-tight text-white">Overview</h1>
          <p className="mt-1 text-sm text-white/45">
            {recipient
              ? `Scoped to treasury ${recipient.slice(0, 6)}…${recipient.slice(-4)}`
              : involvedParam
                ? "Payments where your connected wallets are the payer or recipient (send or receive)."
                : "Real-time volume and settlement activity (all recipients)"}
          </p>
        </div>
        <button
          type="button"
          onClick={handleRefreshAll}
          className="inline-flex items-center justify-center gap-2 self-start rounded-xl border border-white/[0.1] bg-white/[0.05] px-4 py-2.5 text-sm font-medium text-white/90 shadow-[0_0_0_1px_rgba(255,255,255,0.04)] backdrop-blur-md transition hover:border-[#B2C8BC]/30 hover:text-white"
        >
          <RefreshCw
            className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`}
            strokeWidth={1.75}
          />
          Refresh data
        </button>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <StatCard
          title="Total volume"
          value={volumeDisplay}
          subtitle={`${metrics?.successCount ?? 0} successful payment intents`}
          icon={TrendingUp}
          active
        />
        <PlanStatusCard metrics={metrics} />
      </div>

      <RecipientFilter />

      <div className="max-w-xl">{searchBar}</div>

      <TransactionFeedPanel
        searchQuery={debounced}
        recipient={recipient}
        involved={involvedParam}
        viewerAddresses={involvedWallets}
      />
    </div>
  );
}

function formatSol(raw: string): string {
  const n = Number(raw);
  if (Number.isNaN(n)) return raw;
  return n.toLocaleString(undefined, {
    maximumFractionDigits: 9,
    minimumFractionDigits: 0,
  });
}
