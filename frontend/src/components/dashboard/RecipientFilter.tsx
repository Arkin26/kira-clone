"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Filter } from "lucide-react";
import { useEffect, useState } from "react";

/**
 * Sets `?recipient=<address>` so the dashboard feed and metrics scope to that treasury.
 * Leave empty and apply to show **all** recipients.
 */
export function RecipientFilter() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const fromUrl = searchParams.get("recipient") ?? "";
  const [value, setValue] = useState(fromUrl);

  useEffect(() => {
    setValue(fromUrl);
  }, [fromUrl]);

  const apply = () => {
    const p = new URLSearchParams(searchParams.toString());
    const v = value.trim();
    if (v) {
      p.set("recipient", v);
    } else {
      p.delete("recipient");
    }
    const qs = p.toString();
    router.push(qs ? `${pathname}?${qs}` : pathname);
  };

  const clear = () => {
    setValue("");
    const p = new URLSearchParams(searchParams.toString());
    p.delete("recipient");
    const qs = p.toString();
    router.push(qs ? `${pathname}?${qs}` : pathname);
  };

  return (
    <div className="rounded-2xl border border-white/[0.08] bg-white/[0.04] p-4">
      <div className="mb-2 flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-white/45">
        <Filter className="h-3.5 w-3.5" strokeWidth={1.75} />
        Recipient filter
      </div>
      <p className="mb-3 text-xs text-white/35">
        Show only payments sent to this Solana (or <code className="text-white/50">0x…</code> EVM) address.
        Clear the field and apply to see everyone.
      </p>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <input
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="All recipients — or paste treasury address"
          className="min-w-0 flex-1 rounded-xl border border-white/[0.08] bg-[#020202]/50 px-3 py-2.5 font-mono text-xs text-white placeholder:text-white/25 outline-none focus:border-[#B2C8BC]/35"
          spellCheck={false}
        />
        <div className="flex gap-2">
          <button
            type="button"
            onClick={apply}
            className="rounded-xl bg-[#84A794]/25 px-4 py-2.5 text-sm font-medium text-[#B2C8BC] transition hover:bg-[#84A794]/35"
          >
            Apply
          </button>
          <button
            type="button"
            onClick={clear}
            className="rounded-xl border border-white/[0.1] px-4 py-2.5 text-sm text-white/60 transition hover:bg-white/[0.05]"
          >
            Clear
          </button>
        </div>
      </div>
    </div>
  );
}
