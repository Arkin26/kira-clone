"use client";

import { motion } from "framer-motion";

/** Arc geometry in SVG viewBox units (1200 × 500). */
const ARC_CX = 600;
const ARC_CY = 278;
const ARC_RX = 500;
const ARC_RY = 178;

function CoinBadge() {
  return (
    <div className="relative overflow-hidden">
      <motion.div
        initial={{ opacity: 0, scale: 0.25 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.6, delay: 0.35, ease: "easeOut" }}
        className="pointer-events-none absolute left-1/2 top-1/2 h-36 w-36 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#b9d7ca]/50 blur-2xl"
        aria-hidden
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.45 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.3, delay: 0.3, ease: "easeOut" }}
        className="pointer-events-none absolute left-1/2 top-1/2 h-16 w-16 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#dff3ea]/55 blur-xl"
        aria-hidden
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.7 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.9, delay: 0.15, ease: [0.2, 0.8, 0.2, 1] }}
        className="relative flex h-12 w-12 items-center justify-center overflow-hidden rounded-full border border-[#d4eee4]/65 bg-[radial-gradient(circle_at_30%_22%,rgba(233,251,244,0.5),rgba(173,214,198,0.35)_45%,rgba(90,138,123,0.35)_100%)] shadow-[0_0_32px_8px_rgba(178,200,188,0.7)] backdrop-blur-xl"
      >
        <div className="absolute inset-[1px] rounded-full bg-[radial-gradient(circle_at_25%_18%,rgba(255,255,255,0.55),rgba(255,255,255,0.18)_35%,rgba(255,255,255,0.05)_70%,rgba(255,255,255,0)_100%)]" />
        <div className="absolute bottom-1 left-1/2 h-4 w-8 -translate-x-1/2 rounded-full bg-black/10 blur-md" />
        <span className="relative font-mulish text-base font-bold tracking-tight text-white drop-shadow-[0_0_8px_rgba(236,255,247,0.55)]">
          K
        </span>
      </motion.div>
    </div>
  );
}

function StaticBars() {
  const bars = [{ height: 24 }, { height: 30 }, { height: 36 }];

  return (
    <div
      aria-hidden
      style={{ display: "flex", alignItems: "flex-start", gap: "10px" }}
    >
      {bars.map((bar, i) => (
        <span
          key={i}
          style={{
            display: "block",
            width: "3px",
            height: `${bar.height}px`,
            background:
              "linear-gradient(to bottom, rgba(255,255,255,0) 0%, rgba(255,255,255,0.9) 100%)",
            borderRadius: "0 0 2px 2px",
          }}
        />
      ))}
    </div>
  );
}

export function HeroSection() {
  return (
    <section className="relative overflow-hidden px-4 pb-24 pt-6 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.6, delay: 0.1, ease: "easeOut" }}
        className="pointer-events-none absolute inset-x-0 -top-24 h-[620px]"
        style={{
          background:
            "radial-gradient(ellipse 60% 56% at 50% -8%, rgba(220, 247, 238, 0.5) 0%, rgba(174, 210, 195, 0.24) 34%, rgba(18, 28, 24, 0.12) 58%, rgba(2, 2, 2, 0) 76%)",
        }}
        aria-hidden
      />
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.5, delay: 0.2, ease: "easeOut" }}
        className="pointer-events-none absolute left-1/2 top-0 h-[420px] w-[30%] min-w-[220px] -translate-x-1/2"
        style={{
          background:
            "linear-gradient(to bottom, rgba(226, 247, 239, 0.38) 0%, rgba(176, 210, 195, 0.16) 34%, rgba(18, 28, 24, 0.07) 60%, rgba(2, 2, 2, 0) 100%)",
          filter: "blur(24px)",
        }}
        aria-hidden
      />

      <div className="relative mx-auto max-w-6xl">
        <div className="relative mx-auto max-w-4xl">
          <div className="relative mt-2 h-[380px] sm:h-[420px] lg:h-[460px]">
            <motion.svg
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1.4, delay: 0.55, ease: "easeOut" }}
              viewBox="0 0 1200 500"
              className="pointer-events-none absolute inset-0 h-full w-full"
              preserveAspectRatio="xMidYMid meet"
              aria-hidden
            >
              <defs>
                <linearGradient id="k-arc-stroke" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="rgba(255,255,255,0)" />
                  <stop offset="34%" stopColor="rgba(255,255,255,0.35)" />
                  <stop offset="50%" stopColor="rgba(255,255,255,0.7)" />
                  <stop offset="66%" stopColor="rgba(255,255,255,0.35)" />
                  <stop offset="100%" stopColor="rgba(255,255,255,0)" />
                </linearGradient>
                <linearGradient id="k-arc-soft" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="rgba(178,200,188,0)" />
                  <stop offset="50%" stopColor="rgba(208,233,223,0.42)" />
                  <stop offset="100%" stopColor="rgba(178,200,188,0)" />
                </linearGradient>
                <filter id="k-arc-glow" x="-10%" y="-20%" width="120%" height="140%">
                  <feGaussianBlur stdDeviation="12" />
                </filter>
              </defs>
              <path
                d={`M ${ARC_CX - ARC_RX} ${ARC_CY} A ${ARC_RX} ${ARC_RY} 0 0 1 ${ARC_CX + ARC_RX} ${ARC_CY}`}
                fill="none"
                stroke="url(#k-arc-soft)"
                strokeWidth="48"
                filter="url(#k-arc-glow)"
              />
              <path
                d={`M ${ARC_CX - ARC_RX} ${ARC_CY} A ${ARC_RX} ${ARC_RY} 0 0 1 ${ARC_CX + ARC_RX} ${ARC_CY}`}
                fill="none"
                stroke="url(#k-arc-stroke)"
                strokeWidth="1.5"
              />
            </motion.svg>

            <div className="absolute left-1/2 top-[26%] -translate-x-1/2 -translate-y-1/2">
              <CoinBadge />
            </div>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1.1, delay: 1.0, ease: "easeOut" }}
              className="absolute inset-x-0 top-[38%] px-4 text-center"
            >
              <h1 className="font-mulish text-4xl font-semibold leading-[1.02] tracking-tight text-white sm:text-6xl lg:text-[4.25rem]">
                Manage Money.
                <br />
                The Smart Way.
              </h1>
            </motion.div>
          </div>

          <div className="-mt-[160px] flex flex-col items-center gap-6 pt-6 text-center sm:-mt-[156px] sm:pt-8">
            <motion.p
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1.0, delay: 1.3, ease: "easeOut" }}
              className="max-w-lg text-sm leading-relaxed text-white/55 sm:text-base"
            >
              Non-custodial, intent-based checkout on Solana. Your wallet signs,
              K-INTENT verifies on-chain, and merchants settle with confidence.
            </motion.p>
            <motion.a
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, delay: 1.55, ease: "easeOut" }}
              href="#checkout"
              className="inline-flex items-center gap-2 rounded-full bg-white px-7 py-3 text-sm font-semibold text-[#020202] shadow-[0_0_28px_rgba(178,200,188,0.35)] transition hover:bg-[#e9efeb] active:scale-[0.98]"
            >
              Pay Now
            </motion.a>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.9, delay: 1.85, ease: "easeOut" }}
              className="mt-4"
            >
              <StaticBars />
            </motion.div>
          </div>
        </div>
      </div>
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16" aria-hidden>
        <div className="absolute bottom-0 left-1/2 h-px w-[80%] -translate-x-1/2 bg-gradient-to-r from-white/0 via-[#e8f7f0]/90 to-white/0" />
      </div>
    </section>
  );
}
