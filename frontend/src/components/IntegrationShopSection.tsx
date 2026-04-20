"use client";

import { motion } from "framer-motion";

const BODY_COPY =
  "It costs nothing to pay PayPal, you'll only be charged a fee when you sell something or request a payment.";

const FEATURES_TEXT =
  "No payments back when you need to be online. Faster implementation and a global rollout get you live sooner";

/** Mint accent aligned with TokenSection — inner glow only, no box borders */
const GLOW = "158, 255, 214";

const viewport = { once: true, amount: 0.22 } as const;

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.75, ease: "easeOut" as const },
  },
};

const cardsContainer = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.14, delayChildren: 0.08 },
  },
};

const cardItem = {
  hidden: { opacity: 0, y: 36 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.78, ease: "easeOut" as const },
  },
};

export function IntegrationShopSection() {
  return (
    <section
      id="checkout"
      className="scroll-mt-24 font-mulish w-full max-w-full box-border bg-black px-[8vw] pb-[clamp(56px,8vw,90px)] pt-[clamp(28px,4vw,48px)]"
      style={{ fontFamily: "var(--font-mulish), system-ui, sans-serif" }}
    >
      <motion.div
        className="mx-auto flex max-w-[1100px] flex-col items-center text-center"
        initial="hidden"
        whileInView="show"
        viewport={viewport}
        variants={fadeUp}
      >
        <span className="inline-block rounded border border-white/[0.12] px-2.5 py-1 text-[11px] font-normal uppercase tracking-[0.16em] text-white/55">
          Integration
        </span>
        <h2 className="mt-3 max-w-[20ch] text-balance text-[clamp(1.75rem,4.2vw,2.75rem)] font-medium leading-[1.08] tracking-[-0.02em] text-white/[0.92]">
          Shop everywhere, anywhere
        </h2>
        <p className="mt-3 max-w-[min(52ch,92vw)] text-pretty text-[clamp(0.95rem,2vw,1.1rem)] font-normal leading-relaxed tracking-[-0.01em] text-white/50">
          Join the SafeFound Futures evaluation to demonstrate your trading skills.
        </p>
      </motion.div>

      <motion.div
        className="mx-auto mt-[clamp(28px,4vw,40px)] grid max-w-[1100px] grid-cols-1 items-stretch gap-5 lg:grid-cols-[minmax(0,0.92fr)_minmax(0,1.25fr)] lg:gap-6"
        initial="hidden"
        whileInView="show"
        viewport={viewport}
        variants={cardsContainer}
      >
        {/* Personal */}
        <motion.article
          variants={cardItem}
          className="relative flex min-h-[280px] flex-col overflow-hidden rounded-[22px] bg-black px-8 py-8 text-left shadow-[0_16px_48px_rgba(0,0,0,0.45)]"
          style={{
            backgroundImage: `radial-gradient(ellipse 85% 70% at 92% 8%, rgba(${GLOW},0.324) 0%, transparent 55%), linear-gradient(165deg, rgba(255,255,255,0.072) 0%, rgba(255,255,255,0.018) 100%)`,
          }}
        >
          <h3 className="text-lg font-medium text-white">Personal</h3>
          <p className="mt-4 flex-1 text-[15px] leading-relaxed text-[#cccccc]">{BODY_COPY}</p>
          <button
            type="button"
            className="mt-8 w-full rounded-full border border-white/80 bg-transparent py-3 text-center text-sm font-semibold text-white transition hover:bg-white/5"
          >
            Get Funded
          </button>
        </motion.article>

        {/* Always Protected + Features — vertically centered vs grid row (matches Personal card height) */}
        <motion.article
          variants={cardItem}
          className="relative flex h-full min-h-0 flex-col justify-center overflow-x-clip overflow-y-visible rounded-[22px] bg-black px-8 py-8 shadow-[0_16px_48px_rgba(0,0,0,0.45)] lg:min-h-0"
          style={{
            backgroundImage: `radial-gradient(ellipse 90% 65% at 50% 100%, rgba(${GLOW},0.252) 0%, transparent 52%), linear-gradient(165deg, rgba(255,255,255,0.063) 0%, rgba(255,255,255,0.0144) 100%)`,
          }}
        >
          <div className="flex w-full flex-col gap-6 md:flex-row md:items-stretch md:gap-0">
            <div className="min-w-0 flex-1 md:flex md:flex-col md:justify-center md:pr-4">
              <h3 className="text-lg font-medium text-white md:-translate-y-2.5">Always Protected</h3>
              <p className="mt-4 text-[15px] leading-relaxed text-[#cccccc] md:-translate-y-2">{BODY_COPY}</p>
            </div>

            {/* Plain white divider: 2× previous span → 120% of column / max full width on mobile */}
            <div
              className="relative flex shrink-0 items-center justify-center overflow-visible md:self-stretch md:px-3"
              aria-hidden
            >
              <div className="h-px w-[min(120%,100%)] max-w-full bg-white/35 md:hidden" />
              <div className="relative hidden h-full min-h-0 w-px items-center justify-center md:flex">
                <div className="absolute left-1/2 h-[120%] w-px min-h-0 shrink-0 -translate-x-1/2 bg-white/35" />
              </div>
            </div>

            <div className="min-w-0 flex-1 md:flex md:flex-col md:justify-center md:pl-4">
              <h3 className="text-lg font-medium text-white">Features</h3>
              <p className="mt-4 text-left text-[15px] leading-relaxed text-[#cccccc]">{FEATURES_TEXT}</p>
            </div>
          </div>
        </motion.article>
      </motion.div>
    </section>
  );
}
