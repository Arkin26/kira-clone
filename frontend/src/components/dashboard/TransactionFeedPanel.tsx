"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { RefreshCw, Search } from "lucide-react";
import { useEffect, useState } from "react";

import { fetchPayments } from "@/lib/api";

import { ExportCsvButton } from "./ExportCsvButton";
import { TableSkeleton } from "./TableSkeleton";
import { TransactionTable } from "./TransactionTable";

type Props = {
  /** Debounced search sent to API */
  searchQuery: string;
  /** Filter by intent treasury (Solana / EVM) */
  recipient?: string;
  /** Comma-separated wallets: match payer or treasury */
  involved?: string;
  /** For direction column (sent vs received) */
  viewerAddresses?: string[];
};

export function TransactionFeedPanel({
  searchQuery,
  recipient,
  involved,
  viewerAddresses,
}: Props) {
  const queryClient = useQueryClient();
  const { data, isLoading, isFetching, error, refetch } = useQuery({
    queryKey: ["payments", searchQuery, recipient ?? "", involved ?? ""],
    queryFn: () => fetchPayments(searchQuery || undefined, recipient, involved),
  });

  const rows = data ?? [];

  const handleRefresh = () => {
    void queryClient.invalidateQueries({ queryKey: ["payment-metrics"] });
    void refetch();
  };

  return (
    <div className="overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.05] shadow-[0_0_0_1px_rgba(255,255,255,0.04)] backdrop-blur-[12px]">
      <div className="flex flex-col gap-3 border-b border-white/[0.06] px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
        <div>
          <h2 className="font-mulish text-base font-semibold text-white">Transaction feed</h2>
          <p className="text-xs text-white/40">Solana Devnet · signed intents</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <ExportCsvButton rows={rows} disabled={isLoading} />
          <button
            type="button"
            onClick={handleRefresh}
            disabled={isFetching}
            className="inline-flex items-center gap-2 rounded-xl border border-white/[0.1] bg-white/[0.04] px-3 py-2 text-xs font-medium text-white/85 transition hover:border-[#B2C8BC]/35 hover:text-white disabled:opacity-50"
          >
            <RefreshCw
              className={`h-3.5 w-3.5 ${isFetching ? "animate-spin" : ""}`}
              strokeWidth={1.75}
            />
            Refresh
          </button>
        </div>
      </div>
      {error ? (
        <div className="px-5 py-10 text-center text-sm text-red-300/90">
          {(error as Error).message || "Failed to load payments"}
        </div>
      ) : isLoading ? (
        <TableSkeleton />
      ) : (
        <TransactionTable rows={rows} viewerAddresses={viewerAddresses} />
      )}
    </div>
  );
}

/** Search input + debounced query for parent */
export function useDebouncedSearch(delayMs = 400) {
  const [input, setInput] = useState("");
  const [debounced, setDebounced] = useState("");

  useEffect(() => {
    const t = setTimeout(() => setDebounced(input.trim()), delayMs);
    return () => clearTimeout(t);
  }, [input, delayMs]);

  const searchBar = (
    <div className="relative">
      <Search
        className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/35"
        strokeWidth={1.75}
      />
      <input
        type="search"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Search by intent ID or signature…"
        className="w-full rounded-xl border border-white/[0.08] bg-white/[0.04] py-2.5 pl-10 pr-4 text-sm text-white placeholder:text-white/30 outline-none ring-[#B2C8BC]/20 transition focus:border-[#B2C8BC]/35 focus:ring-2"
        aria-label="Search transactions"
      />
    </div>
  );

  return { input, setInput, debounced, searchBar };
}
