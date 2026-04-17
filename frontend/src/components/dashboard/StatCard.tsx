import type { LucideIcon } from "lucide-react";

type Props = {
  title: string;
  value: string;
  subtitle?: string;
  icon: LucideIcon;
  active?: boolean;
};

export function StatCard({ title, value, subtitle, icon: Icon, active }: Props) {
  return (
    <div
      className={`rounded-2xl border border-white/[0.08] bg-white/[0.05] p-6 shadow-[0_0_0_1px_rgba(255,255,255,0.04)] backdrop-blur-[12px] transition ${
        active
          ? "shadow-[0_0_28px_rgba(178,200,188,0.22)] ring-1 ring-[#B2C8BC]/35"
          : ""
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-white/45">{title}</p>
          <p className="mt-2 font-mulish text-2xl font-semibold tracking-tight text-white">{value}</p>
          {subtitle ? <p className="mt-1 text-sm text-white/40">{subtitle}</p> : null}
        </div>
        <div
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-white/[0.08] ${
            active ? "text-[#B2C8BC] shadow-[0_0_16px_rgba(178,200,188,0.2)]" : "text-white/50"
          }`}
        >
          <Icon className="h-5 w-5" strokeWidth={1.75} />
        </div>
      </div>
    </div>
  );
}
