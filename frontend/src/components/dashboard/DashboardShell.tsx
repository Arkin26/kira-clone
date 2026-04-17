import type { ReactNode } from "react";

import { DashboardSidebar } from "./DashboardSidebar";

export function DashboardShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-[#020202]">
      {/* Eclipse background */}
      <div
        className="pointer-events-none fixed inset-x-0 -top-40 h-[420px] opacity-90"
        style={{
          background:
            "radial-gradient(ellipse 65% 50% at 50% 0%, rgba(132, 167, 148, 0.22) 0%, rgba(2, 2, 2, 0) 60%)",
        }}
      />
      <div className="relative flex min-h-screen flex-col lg:flex-row">
        <DashboardSidebar />
        <main className="flex-1 lg:pl-56">
          <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">{children}</div>
        </main>
      </div>
    </div>
  );
}
