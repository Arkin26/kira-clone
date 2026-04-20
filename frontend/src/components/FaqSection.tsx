"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useCallback, useEffect, useRef, useState } from "react";

const ROTATE_MS = 3000;

const FAQ_ITEMS = [
  {
    title: "Emerging Technologies Showcase",
    body:
      "Join the SafeFound Futures evaluation to demonstrate your trading skills. Complete the goals and secure funding in as little as 4 days.",
  },
  {
    title: "Research and Development",
    body:
      "We continuously improve intent verification, settlement paths, and merchant tooling so you stay ahead as chains and standards evolve.",
  },
  {
    title: "Collaborative Partnership",
    body:
      "Work with our team to tailor checkout flows, webhooks, and treasury policies to your stack — from devnet trials to production rollouts.",
  },
  {
    title: "Future Vision and Roadmap",
    body:
      "Multi-chain intents, richer analytics, and deeper wallet integrations are on the roadmap — built around non-custodial, verifiable payments.",
  },
] as const;

function ToggleIcon({ expanded }: { expanded: boolean }) {
  return (
    <span
      className="flex h-8 w-8 shrink-0 items-center justify-center text-lg font-light leading-none text-white"
      aria-hidden
    >
      {expanded ? "+" : "—"}
    </span>
  );
}

export function FaqSection() {
  const [openIndex, setOpenIndex] = useState(0);
  const rotateRef = useRef(0);

  const scheduleRotate = useCallback(() => {
    window.clearInterval(rotateRef.current);
    rotateRef.current = window.setInterval(() => {
      setOpenIndex((i) => (i + 1) % FAQ_ITEMS.length);
    }, ROTATE_MS);
  }, []);

  useEffect(() => {
    scheduleRotate();
    return () => window.clearInterval(rotateRef.current);
  }, [scheduleRotate]);

  const selectIndex = useCallback(
    (index: number) => {
      setOpenIndex(index);
      scheduleRotate();
    },
    [scheduleRotate],
  );

  return (
    <section
      className="w-full bg-[#020202] px-4 pb-20 pt-14 sm:px-6 sm:pt-16 lg:px-8"
      aria-labelledby="faq-heading"
    >
      <div className="mx-auto max-w-2xl">
        <h2
          id="faq-heading"
          className="mb-10 text-center font-mulish text-4xl font-semibold tracking-tight text-white sm:text-5xl"
        >
          FAQ
        </h2>

        <div className="flex flex-col gap-3">
          {FAQ_ITEMS.map((item, index) => {
            const expanded = openIndex === index;
            const num = String(index + 1).padStart(2, "0");

            return (
              <div
                key={item.title}
                className="overflow-hidden rounded-2xl border border-white/[0.06] bg-[#141414]"
              >
                <button
                  type="button"
                  onClick={() => selectIndex(index)}
                  className="flex w-full items-start justify-between gap-4 px-5 py-4 text-left transition hover:bg-white/[0.03] sm:px-6 sm:py-5"
                  aria-expanded={expanded}
                >
                  <span className="font-mulish text-[15px] font-medium leading-snug text-white sm:text-base">
                    <span className="text-white/90">{num}</span>{" "}
                    <span className="text-white">{item.title}</span>
                  </span>
                  <ToggleIcon expanded={expanded} />
                </button>

                <AnimatePresence initial={false}>
                  {expanded ? (
                    <motion.div
                      key="content"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{
                        height: { duration: 0.38, ease: [0.4, 0, 0.2, 1] },
                        opacity: { duration: 0.28, ease: "easeOut" },
                      }}
                      className="overflow-hidden"
                    >
                      <motion.p
                        initial={{ opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 2 }}
                        transition={{ duration: 0.25, ease: "easeOut" }}
                        className="px-5 pb-5 pt-0 text-[15px] leading-relaxed text-white/75 sm:px-6 sm:pb-6"
                      >
                        {item.body}
                      </motion.p>
                    </motion.div>
                  ) : null}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
