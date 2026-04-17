"use client";

import { TransactionFeedPanel, useDebouncedSearch } from "@/components/dashboard/TransactionFeedPanel";

export default function DashboardPaymentsPage() {
  const { debounced, searchBar } = useDebouncedSearch();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-mulish text-2xl font-semibold tracking-tight text-white">Payments</h1>
        <p className="mt-1 text-sm text-white/45">Search and export your payment intents</p>
      </div>
      <div className="max-w-xl">{searchBar}</div>
      <TransactionFeedPanel searchQuery={debounced} />
    </div>
  );
}
