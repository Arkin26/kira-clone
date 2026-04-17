import { Construction } from "lucide-react";

export default function DashboardSettlementsPage() {
  return (
    <div className="rounded-2xl border border-white/[0.08] bg-white/[0.05] p-10 text-center backdrop-blur-[12px]">
      <Construction className="mx-auto h-10 w-10 text-[#B2C8BC]/80" strokeWidth={1.5} />
      <h1 className="mt-4 font-mulish text-xl font-semibold text-white">Settlements</h1>
      <p className="mt-2 text-sm text-white/45">Batch settlement flows and reconciliation — coming soon.</p>
    </div>
  );
}
