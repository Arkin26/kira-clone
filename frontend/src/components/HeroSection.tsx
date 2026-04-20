"use client";

import { motion } from "framer-motion";
import Image from "next/image";

/** Arc geometry in SVG viewBox units (1200 × 600). */
const ARC_CX = 600;
const ARC_CY = 278;
const ARC_RX = 500;
/** Vertical radius; ~30% longer curve vs prior 212px unit sag */
const ARC_RY = 276;

/** Mint — arc glow + coin (#9EFFD6) */
const ARC_GLOW_RGB = "158,255,214";

function CoinBadge() {
  const g = ARC_GLOW_RGB;
  return (
    <div className="relative overflow-hidden rounded-full shadow-[0_4px_24px_rgba(158,255,214,0.12),inset_0_0_1px_rgba(255,255,255,0.12)]">
      <motion.div
        initial={{ opacity: 0, scale: 0.7 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.9, delay: 0.15, ease: [0.2, 0.8, 0.2, 1] }}
        className="relative flex h-[58px] w-[58px] items-center justify-center overflow-hidden rounded-full border backdrop-blur-[18px]"
        style={{
          borderColor: `rgba(${g},0.38)`,
          background: `
            linear-gradient(165deg,
              rgba(255,255,255,0.09) 0%,
              rgba(${g},0.07) 38%,
              rgba(255,255,255,0.04) 55%,
              rgba(${g},0.06) 100%
            )`,
          boxShadow: `
            inset 0 1px 1px rgba(255,255,255,0.35),
            inset 0 -1px 1px rgba(${g},0.22),
            inset 0 0 20px rgba(${g},0.06)`,
        }}
      >
        {/* Bottom ~⅓: inner white pool (circular / elliptical) */}
        <div
          className="pointer-events-none absolute inset-0 rounded-full"
          style={{
            background: `radial-gradient(ellipse 108% 52% at 50% 100%, rgba(255,255,255,0.62) 0%, rgba(255,255,255,0.28) 28%, rgba(255,255,255,0.06) 48%, transparent 52%)`,
          }}
          aria-hidden
        />
        {/* Green liquid highlights — upper arc + edge */}
        <div
          className="pointer-events-none absolute inset-0 rounded-full"
          style={{
            background: `radial-gradient(ellipse 92% 48% at 50% 0%, rgba(${g},0.42) 0%, rgba(${g},0.12) 38%, transparent 62%)`,
          }}
          aria-hidden
        />
        <div
          className="pointer-events-none absolute inset-0 rounded-full"
          style={{
            background: `radial-gradient(circle at 50% 50%, transparent 52%, rgba(${g},0.14) 74%, rgba(${g},0.32) 100%)`,
          }}
          aria-hidden
        />
        <div
          className="pointer-events-none absolute inset-[2px] rounded-full"
          style={{
            background: `radial-gradient(circle at 28% 22%, rgba(255,255,255,0.35) 0%, rgba(${g},0.28) 22%, transparent 48%)`,
          }}
          aria-hidden
        />
        <Image
          src="/icons8-magento-50.png"
          alt=""
          width={36}
          height={36}
          className="relative z-[1] h-9 w-9 object-contain drop-shadow-[0_1px_2px_rgba(0,0,0,0.15)]"
          aria-hidden
        />
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
  const g = ARC_GLOW_RGB;
  return (
    <section className="relative overflow-x-clip px-4 pb-24 pt-6 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.6, delay: 0.1, ease: "easeOut" }}
        className="pointer-events-none absolute inset-x-0 -top-24 h-[620px]"
        style={{
          background: `radial-gradient(ellipse 60% 56% at 50% -8%, rgba(${g},0.48) 0%, rgba(${g},0.22) 34%, rgba(${g},0.09) 58%, rgba(${g},0) 76%)`,
        }}
        aria-hidden
      />
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.5, delay: 0.2, ease: "easeOut" }}
        className="pointer-events-none absolute left-1/2 top-0 h-[420px] w-[30%] min-w-[220px] -translate-x-1/2"
        style={{
          background: `linear-gradient(to bottom, rgba(${g},0.36) 0%, rgba(${g},0.15) 34%, rgba(${g},0.05) 60%, rgba(${g},0) 100%)`,
          filter: "blur(24px)",
        }}
        aria-hidden
      />

      <div className="relative mx-auto max-w-6xl">
        <div className="relative mx-auto max-w-4xl">
          <div className="relative mt-2 min-h-[380px] overflow-visible sm:min-h-[420px] lg:min-h-[460px]">
            <div className="pointer-events-none absolute inset-0 translate-y-[100px] overflow-visible">
              <motion.svg
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1.4, delay: 0.55, ease: "easeOut" }}
                viewBox="0 0 1200 600"
                className="absolute inset-0 z-0 h-full w-full overflow-visible"
                preserveAspectRatio="xMidYMid meet"
                aria-hidden
              >
                <defs>
                  <linearGradient id="k-arc-stroke" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="rgba(255,255,255,0)" />
                    <stop offset="34%" stopColor="rgba(255,255,255,0.14)" />
                    <stop offset="50%" stopColor="rgba(230,235,233,0.38)" />
                    <stop offset="66%" stopColor="rgba(255,255,255,0.14)" />
                    <stop offset="100%" stopColor="rgba(255,255,255,0)" />
                  </linearGradient>
                  <linearGradient id="k-arc-soft" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor={`rgba(${ARC_GLOW_RGB},0)`} />
                    <stop offset="42%" stopColor={`rgba(${ARC_GLOW_RGB},0.35)`} />
                    <stop offset="50%" stopColor={`rgba(${ARC_GLOW_RGB},0.72)`} />
                    <stop offset="58%" stopColor={`rgba(${ARC_GLOW_RGB},0.35)`} />
                    <stop offset="100%" stopColor={`rgba(${ARC_GLOW_RGB},0)`} />
                  </linearGradient>
                  <filter id="k-arc-glow-outer" x="-35%" y="-55%" width="170%" height="210%">
                    <feGaussianBlur stdDeviation="34" />
                  </filter>
                  <filter id="k-arc-glow" x="-28%" y="-45%" width="156%" height="190%">
                    <feGaussianBlur stdDeviation="22" />
                  </filter>
                </defs>
                {/* large-arc 1 = upper half of ellipse so apex is above the chord; coin sits on the peak */}
                <path
                  d={`M ${ARC_CX - ARC_RX} ${ARC_CY} A ${ARC_RX} ${ARC_RY} 0 1 1 ${ARC_CX + ARC_RX} ${ARC_CY}`}
                  fill="none"
                  stroke="url(#k-arc-soft)"
                  strokeWidth="88"
                  opacity={0.42}
                  filter="url(#k-arc-glow-outer)"
                />
                <path
                  d={`M ${ARC_CX - ARC_RX} ${ARC_CY} A ${ARC_RX} ${ARC_RY} 0 1 1 ${ARC_CX + ARC_RX} ${ARC_CY}`}
                  fill="none"
                  stroke="url(#k-arc-soft)"
                  strokeWidth="56"
                  filter="url(#k-arc-glow)"
                />
                <path
                  d={`M ${ARC_CX - ARC_RX} ${ARC_CY} A ${ARC_RX} ${ARC_RY} 0 1 1 ${ARC_CX + ARC_RX} ${ARC_CY}`}
                  fill="none"
                  stroke="url(#k-arc-stroke)"
                  strokeWidth="1.5"
                />
              </motion.svg>

              {/* Center on arc apex: y ≈ ARC_CY − ARC_RY in viewBox → ~0.33% of 600; z-10 keeps coin above strokes */}
              <div
                className="absolute left-1/2 z-10 -translate-x-1/2 -translate-y-1/2"
                style={{
                  top: `calc(${((ARC_CY - ARC_RY) / 600) * 100}% + 6px)`,
                }}
              >
                <CoinBadge />
              </div>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1.1, delay: 1.0, ease: "easeOut" }}
              className="absolute inset-x-0 top-[calc(38%+40px)] px-4 text-center"
            >
              <h1 className="font-mulish text-4xl font-semibold leading-[1.02] tracking-tight text-white sm:text-6xl lg:text-[4.25rem]">
                Manage Money.
                <br />
                The Smart Way.
              </h1>
            </motion.div>
          </div>

          <div className="-mt-[120px] flex flex-col items-center gap-6 pt-6 text-center sm:-mt-[116px] sm:pt-8">
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
      {/*
        Floor glow: full-width container; upper stack is 70vw so glow corners span ~70% of screen.
        Lower: shallow + flat. Masks soften L/R edges.
      */}
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 z-0 h-[min(44vh,340px)] overflow-visible"
        aria-hidden
      >
        {/* Downward dome — mirror of upward glow; same width; height = 30% of top dome */}
        <div
          className="absolute left-1/2 top-full w-[180vw] max-w-none -translate-x-1/2"
          style={{
            height: "calc(min(62vh, 480px) * 0.3)",
            background: `radial-gradient(
              ellipse 50% 100% at 50% -8%,
              rgba(${g},0.26) 0%,
              rgba(${g},0.14) 32%,
              rgba(${g},0.06) 52%,
              rgba(${g},0.02) 68%,
              transparent 82%
            )`,
            maskImage:
              "radial-gradient(ellipse 100% 100% at 50% 0%, #000 0%, #000 72%, transparent 100%)",
            WebkitMaskImage:
              "radial-gradient(ellipse 100% 100% at 50% 0%, #000 0%, #000 72%, transparent 100%)",
            maskSize: "100% 100%",
            WebkitMaskSize: "100% 100%",
          }}
        />
        {/* Upward dome — 70vw-wide stack; ellipse fills horizontal span so corners sit at ~15% inset from each side */}
        <div
          className="absolute bottom-0 left-1/2 w-[180vw] max-w-none -translate-x-1/2"
          style={{
            height: "min(62vh,480px)",
            background: `radial-gradient(
              ellipse 50% 100% at 50% 108%,
              rgba(${g},0.26) 0%,
              rgba(${g},0.14) 32%,
              rgba(${g},0.06) 52%,
              rgba(${g},0.02) 68%,
              transparent 82%
            )`,
            maskImage:
              "radial-gradient(ellipse 100% 100% at 50% 100%, #000 0%, #000 72%, transparent 100%)",
            WebkitMaskImage:
              "radial-gradient(ellipse 100% 100% at 50% 100%, #000 0%, #000 72%, transparent 100%)",
            maskSize: "100% 100%",
            WebkitMaskSize: "100% 100%",
          }}
        />
        {/* Ambient line + halo — same 70vw footprint */}
        <div
          className="absolute bottom-0 left-1/2 w-[180vw] max-w-none -translate-x-1/2"
          style={{
            height: "1px",
            borderRadius: "50%",
            background: `rgba(${g},0.28)`,
            boxShadow: `
              0 0 100px 60px rgba(${g},0.10),
              0 0 200px 110px rgba(${g},0.065),
              0 0 340px 150px rgba(${g},0.04),
              0 0 520px 200px rgba(${g},0.022)
            `,
            maskImage:
              "radial-gradient(ellipse 100% 100% at 50% 100%, #000 0%, #000 72%, transparent 100%)",
            WebkitMaskImage:
              "radial-gradient(ellipse 100% 100% at 50% 100%, #000 0%, #000 72%, transparent 100%)",
            maskSize: "100% 100%",
            WebkitMaskSize: "100% 100%",
          }}
        />
        {/* Sharp horizon */}
        <div
          className="absolute bottom-0 left-1/2 w-[180vw] max-w-none -translate-x-1/2"
          style={{
            height: "1px",
            background: `linear-gradient(
              to right,
              transparent 0%,
              rgba(${g},0.12) 8%,
              rgba(200,255,235,0.52) 50%,
              rgba(${g},0.12) 92%,
              transparent 100%
            )`,
            maskImage:
              "radial-gradient(ellipse 100% 100% at 50% 100%, #000 0%, #000 72%, transparent 100%)",
            WebkitMaskImage:
              "radial-gradient(ellipse 100% 100% at 50% 100%, #000 0%, #000 72%, transparent 100%)",
            maskSize: "100% 100%",
            WebkitMaskSize: "100% 100%",
          }}
        />
        {/* Faint hairline above horizon */}
        <div
          className="absolute bottom-[2px] left-1/2 w-[180vw] max-w-none -translate-x-1/2"
          style={{
            height: "1px",
            background: `linear-gradient(
              to right,
              transparent,
              rgba(${g},0.09) 36%,
              rgba(210,255,238,0.18) 50%,
              rgba(${g},0.09) 64%,
              transparent
            )`,
            maskImage:
              "radial-gradient(ellipse 100% 100% at 50% 100%, #000 0%, #000 68%, transparent 100%)",
            WebkitMaskImage:
              "radial-gradient(ellipse 100% 100% at 50% 100%, #000 0%, #000 68%, transparent 100%)",
            maskSize: "100% 100%",
            WebkitMaskSize: "100% 100%",
          }}
        />
      </div>
    </section>
  );
}
