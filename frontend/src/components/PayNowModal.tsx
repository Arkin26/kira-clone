"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

import { PaymentWidget } from "@/components/PaymentWidget";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function PayNowModal({ open, onOpenChange }: Props) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {open ? (
        <motion.div
          key="pay-now-modal"
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <motion.button
            type="button"
            aria-label="Close"
            className="absolute inset-0 bg-black/65 backdrop-blur-md"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => onOpenChange(false)}
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="pay-now-title"
            className="relative z-10 max-h-[min(92vh,760px)] w-full max-w-md overflow-y-auto rounded-3xl border border-white/[0.1] bg-[#050505]/98 shadow-[0_24px_80px_rgba(0,0,0,0.65)]"
            initial={{ opacity: 0, scale: 0.96, y: 14 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98, y: 10 }}
            transition={{ type: "spring", damping: 28, stiffness: 320 }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              aria-label="Close payment"
              onClick={() => onOpenChange(false)}
              className="absolute left-4 top-4 z-20 flex h-10 w-10 items-center justify-center rounded-full border border-white/[0.1] bg-white/[0.04] text-white/80 transition hover:bg-white/[0.08] hover:text-white"
            >
              <ArrowLeft className="h-5 w-5" strokeWidth={1.75} />
            </button>
            <div className="p-4 pt-14 sm:p-6 sm:pt-16">
              <h2 id="pay-now-title" className="sr-only">
                Pay now
              </h2>
              <PaymentWidget variant="modal" />
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>,
    document.body,
  );
}
