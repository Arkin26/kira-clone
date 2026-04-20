"use client";

import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

import { PayNowModal } from "@/components/PayNowModal";
import { PrivyNavActions } from "@/components/privy/PrivyNavActions";

const NAV_LINKS = [
  { href: "#footer-product", label: "Product" },
  { href: "#footer-company", label: "Company" },
  { href: "#footer-social", label: "Social" },
  { href: "#footer-legal", label: "Legal" },
] as const;

function BrandLogo() {
  return (
    <>
      <Image
        src="/icons8-magento-50.png"
        alt=""
        width={40}
        height={40}
        className="h-9 w-9 shrink-0 object-contain"
        priority
      />
      <span className="font-mulish text-base font-semibold tracking-tight text-white">
        k-intent
      </span>
    </>
  );
}

function PayNowButton({ className = "", onClick }: { className?: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full bg-white px-5 py-2 text-sm font-semibold text-[#020202] shadow-[0_0_24px_rgba(255,255,255,0.18)] transition hover:bg-[#e9efeb] active:scale-[0.98] ${className}`}
    >
      Pay now
    </button>
  );
}

export function Navbar() {
  const [open, setOpen] = useState(false);
  const [payOpen, setPayOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      <header
        className={`fixed inset-x-0 z-50 transition-[top,padding-left,padding-right] duration-300 ease-out ${
          scrolled ? "top-0" : "top-4 px-4 sm:px-6 lg:px-8"
        }`}
      >
        <div
          className={`mx-auto flex h-16 w-full items-center justify-between gap-6 px-6 transition-[max-width,border-radius,background-color,backdrop-filter,box-shadow,border-color] duration-300 ease-out sm:px-10 md:grid md:grid-cols-[1fr_auto_1fr] md:justify-between md:gap-12 md:px-14 lg:px-20 xl:px-28 2xl:px-32 ${
            scrolled
              ? "max-w-none rounded-none border-b border-white/[0.06] bg-[#050505]/45 shadow-[0_8px_32px_rgba(0,0,0,0.12)] backdrop-blur-xl backdrop-saturate-150 supports-[backdrop-filter]:bg-[#050505]/35"
              : "max-w-[1600px] rounded-full border border-white/[0.08] bg-transparent shadow-none"
          }`}
        >
          <Link
            href="/"
            className="flex -translate-x-5 items-center gap-2.5 md:justify-self-end"
          >
            <BrandLogo />
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

          <div className="hidden translate-x-5 items-center gap-2 md:flex md:justify-self-start md:translate-x-5">
            <Link
              href="/dashboard"
              className="rounded-full border border-white/[0.08] bg-white/[0.03] px-5 py-2 text-sm font-medium text-white/85 transition hover:bg-white/[0.07] hover:text-white"
            >
              Dashboard
            </Link>
            <PrivyNavActions />
            <PayNowButton onClick={() => setPayOpen(true)} />
          </div>

          <button
            type="button"
            aria-label="Open menu"
            className="flex h-10 w-10 translate-x-5 flex-col items-center justify-center gap-1.5 rounded-xl border border-white/[0.08] bg-white/[0.03] md:hidden"
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
                  <BrandLogo />
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
              <div className="mt-4 flex flex-col gap-2">
                <PrivyNavActions />
                <PayNowButton
                  className="w-full"
                  onClick={() => {
                    setOpen(false);
                    setPayOpen(true);
                  }}
                />
              </div>
            </motion.aside>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <PayNowModal open={payOpen} onOpenChange={setPayOpen} />
    </>
  );
}
