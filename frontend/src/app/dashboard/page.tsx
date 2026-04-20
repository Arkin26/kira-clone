import { Suspense } from "react";

import { DashboardOverview } from "@/components/dashboard/DashboardOverview";

export default function DashboardPage() {
  return (
    <Suspense
      fallback={
        <div className="p-10 text-center font-mulish text-sm text-white/45">Loading dashboard…</div>
      }
    >
      <DashboardOverview />
    </Suspense>
  );
}
