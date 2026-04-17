"use client";

import { useWalletModal } from "@solana/wallet-adapter-react-ui";
import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { useState } from "react";

const NAV_LINKS = [
  { href: "#how-it-works", label: "How it Works" },
  { href: "#plans", label: "Plans" },
  { href: "#affiliate", label: "Affiliate" },
  { href: "#support", label: "Support" },
  { href: "#docs", label: "Docs" },
] as const;

function LogoMark() {
  return (
    <div className="relative flex h-9 w-9 items-center justify-center rounded-full bg-[#0a0a0a] ring-1 ring-white/20 shadow-[0_0_18px_4px_rgba(178,200,188,0.3)]">
      <div className="absolute inset-0 rounded-full bg-gradient-to-br from-white/15 via-white/5 to-transparent" />
      <span className="relative font-mulish text-sm font-bold tracking-tight text-white">
        K
      </span>
    </div>
  );
}

function ConnectWalletButton({ className = "" }: { className?: string }) {
  const { setVisible } = useWalletModal();
  return (
    <button
      type="button"
      onClick={() => setVisible(true)}
      className={`rounded-full bg-white px-5 py-2 text-sm font-semibold text-[#020202] shadow-[0_0_24px_rgba(255,255,255,0.18)] transition hover:bg-[#e9efeb] active:scale-[0.98] ${className}`}
    >
      Connect Wallet
    </button>
  );
}

export function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <header className="fixed inset-x-0 top-0 z-50 bg-transparent">
        <div className="mx-auto flex h-16 w-full max-w-[1400px] items-center justify-between gap-6 px-4 sm:px-8 md:grid md:grid-cols-[1fr_auto_1fr] md:justify-between md:gap-12 lg:px-12 xl:px-16">
          <Link href="/" className="flex items-center gap-2.5 md:justify-self-end">
            <LogoMark />
            <span className="font-mulish text-base font-semibold tracking-tight text-white">
              K-INTENT
            </span>
          </Link>

          <nav className="hidden items-center gap-11 md:flex md:justify-self-center">
            {NAV_LINKS.map((l) => (
              <a
                key={l.href}
                href={l.href}
                className="text-base font-medium text-white transition hover:text-white"
              >
                {l.label}
              </a>
            ))}
          </nav>

          <div className="hidden items-center gap-2 md:flex md:justify-self-start">
            <Link
              href="/dashboard"
              className="rounded-full border border-white/[0.08] bg-white/[0.03] px-5 py-2 text-sm font-medium text-white/85 transition hover:bg-white/[0.07] hover:text-white"
            >
              Dashboard
            </Link>
            <ConnectWalletButton />
          </div>

          <button
            type="button"
            aria-label="Open menu"
            className="flex h-10 w-10 flex-col items-center justify-center gap-1.5 rounded-xl border border-white/[0.08] bg-white/[0.03] md:hidden"
            onClick={() => setOpen(true)}
          >
            <span className="h-0.5 w-5 rounded-full bg-white/80" />
            <span className="h-0.5 w-5 rounded-full bg-white/80" />
            <span className="h-0.5 w-5 rounded-full bg-white/80" />
          </button>
        </div>
      </header>

      <AnimatePresence>
        {open ? (
          <motion.div
            key="mobile-nav"
            className="fixed inset-0 z-50 md:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.button
              type="button"
              aria-label="Close menu"
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
            />
            <motion.aside
              className="absolute inset-y-0 right-0 flex w-[min(100%,320px)] flex-col border-l border-white/[0.08] bg-[#050505]/95 p-6 shadow-2xl backdrop-blur-xl"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 320 }}
            >
              <div className="mb-8 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <LogoMark />
                  <span className="font-mulish font-semibold text-white">
                    K-INTENT
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="rounded-lg border border-white/[0.1] px-3 py-1 text-xs text-white/70"
                >
                  Close
                </button>
              </div>
              <nav className="flex flex-1 flex-col gap-1">
                <Link
                  href="/dashboard"
                  className="rounded-xl px-3 py-3 text-base font-medium text-white/80 transition hover:bg-white/[0.05] hover:text-white"
                  onClick={() => setOpen(false)}
                >
                  Dashboard
                </Link>
                {NAV_LINKS.map((l) => (
                  <a
                    key={l.href}
                    href={l.href}
                    className="rounded-xl px-3 py-3 text-base font-medium text-white/80 transition hover:bg-white/[0.05] hover:text-white"
                    onClick={() => setOpen(false)}
                  >
                    {l.label}
                  </a>
                ))}
              </nav>
              <ConnectWalletButton className="mt-6 w-full" />
            </motion.aside>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
}
