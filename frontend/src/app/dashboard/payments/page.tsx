"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";

import { RecipientFilter } from "@/components/dashboard/RecipientFilter";
import { TransactionFeedPanel, useDebouncedSearch } from "@/components/dashboard/TransactionFeedPanel";

function PaymentsContent() {
  const searchParams = useSearchParams();
  const recipient = searchParams.get("recipient")?.trim() || undefined;
  const { debounced, searchBar } = useDebouncedSearch();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-mulish text-2xl font-semibold tracking-tight text-white">Payments</h1>
        <p className="mt-1 text-sm text-white/45">Search and export your payment intents</p>
      </div>
      <RecipientFilter />
      <div className="max-w-xl">{searchBar}</div>
      <TransactionFeedPanel searchQuery={debounced} recipient={recipient} />
    </div>
  );
}

export default function DashboardPaymentsPage() {
  return (
    <Suspense
      fallback={
        <div className="p-10 text-center font-mulish text-sm text-white/45">Loading…</div>
      }
    >
      <PaymentsContent />
    </Suspense>
  );
}
