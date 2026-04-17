"use client";

import { CreditCard, LayoutDashboard, Settings, Wallet } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/dashboard/payments", label: "Payments", icon: CreditCard },
  { href: "/dashboard/settlements", label: "Settlements", icon: Wallet },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
] as const;

function isActiveLink(href: string, pathname: string): boolean {
  if (href === "/dashboard") {
    return pathname === "/dashboard" || pathname === "/dashboard/";
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function DashboardSidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex w-full flex-col border-b border-white/[0.08] bg-[#020202]/90 pb-4 pt-4 backdrop-blur-xl lg:fixed lg:inset-y-0 lg:left-0 lg:w-56 lg:border-b-0 lg:border-r lg:pb-0 lg:pt-0">
      <div className="hidden px-5 pb-6 pt-8 lg:block">
        <Link href="/" className="font-mulish text-sm font-semibold tracking-tight text-white">
          K-INTENT
        </Link>
        <p className="mt-1 text-[11px] uppercase tracking-[0.2em] text-[#84A794]/90">Merchant</p>
      </div>
      <nav className="flex flex-wrap gap-1 px-3 lg:flex-col lg:px-3 lg:pt-2">
        {LINKS.map(({ href, label, icon: Icon }) => {
          const active = isActiveLink(href, pathname);
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                active
                  ? "border border-[#B2C8BC]/35 bg-white/[0.06] text-[#B2C8BC] shadow-[0_0_20px_rgba(178,200,188,0.18)]"
                  : "border border-transparent text-white/55 hover:bg-white/[0.04] hover:text-white/85"
              }`}
            >
              <Icon className="h-4 w-4 shrink-0" strokeWidth={1.75} />
              {label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
