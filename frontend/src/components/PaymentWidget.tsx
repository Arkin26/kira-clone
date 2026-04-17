"use client";

import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";
import { PublicKey } from "@solana/web3.js";
import { AnimatePresence, motion } from "framer-motion";
import { useCallback, useMemo, useState } from "react";
import { toast } from "sonner";

import { createPaymentIntent, verifyPayment } from "@/lib/api";
import { MERCHANT_ID, MERCHANT_WALLET } from "@/lib/constants";
import { sendSolPayment } from "@/lib/solana";
import { getWalletTransactionMessage } from "@/lib/wallet-errors";
import type { SerializedPaymentIntent } from "@/types/payment";

type FlowPhase =
  | "idle"
  | "preparing"
  | "signing"
  | "finalizing"
  | "success"
  | "error";

function SageSpinner({ label }: { label: string }) {
  return (
    <div className="flex flex-col items-center gap-4 py-6">
      <div
        className="h-10 w-10 rounded-full border-2 border-[#B2C8BC]/25 border-t-[#B2C8BC] animate-spin"
        aria-hidden
      />
      <p className="text-center text-sm font-medium text-[#B2C8BC]">{label}</p>
    </div>
  );
}

function SuccessCelebration({
  amount,
  onDismiss,
}: {
  amount: string;
  onDismiss: () => void;
}) {
  const particles = useMemo(
    () =>
      Array.from({ length: 10 }, (_, i) => ({
        id: i,
        x: (Math.random() - 0.5) * 120,
        y: (Math.random() - 0.5) * 120,
        delay: i * 0.04,
      })),
    [],
  );

  return (
    <motion.div
      className="absolute inset-0 z-20 flex flex-col items-center justify-center overflow-hidden rounded-3xl bg-[#020202]/90 backdrop-blur-md"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {particles.map((p) => (
        <motion.span
          key={p.id}
          className="pointer-events-none absolute h-2 w-2 rounded-full bg-[#B2C8BC]"
          initial={{ opacity: 0, scale: 0, x: 0, y: 0 }}
          animate={{
            opacity: [0, 1, 0],
            scale: [0, 1, 0.4],
            x: p.x,
            y: p.y,
          }}
          transition={{ duration: 0.9, delay: p.delay, ease: "easeOut" }}
        />
      ))}
      <motion.div
        className="relative flex h-20 w-20 items-center justify-center rounded-full border border-[#B2C8BC]/40 bg-[#84A794]/20 text-3xl text-[#B2C8BC] shadow-[0_0_40px_rgba(178,200,188,0.35)]"
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 260, damping: 18 }}
      >
        <motion.span
          initial={{ scale: 0, rotate: -25 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", stiffness: 400, damping: 15, delay: 0.1 }}
          aria-hidden
        >
          ✓
        </motion.span>
      </motion.div>
      <motion.p
        className="mt-6 font-mulish text-xl font-semibold text-white"
        initial={{ y: 12, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.25 }}
      >
        Payment complete
      </motion.p>
      <motion.p
        className="mt-1 text-sm text-white/50"
        initial={{ y: 8, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.32 }}
      >
        {amount} SOL · USDC intent settled
      </motion.p>
      <motion.button
        type="button"
        className="mt-8 rounded-full border border-white/[0.12] bg-white/[0.06] px-6 py-2.5 text-sm font-medium text-white/80 transition hover:bg-white/[0.1]"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.45 }}
        onClick={onDismiss}
      >
        New payment
      </motion.button>
    </motion.div>
  );
}

export function PaymentWidget() {
  const { connection } = useConnection();
  const { publicKey, sendTransaction, connected } = useWallet();
  const { setVisible } = useWalletModal();

  const [amount, setAmount] = useState("0.1");
  const [phase, setPhase] = useState<FlowPhase>("idle");
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<SerializedPaymentIntent | null>(null);

  const merchantPk = useMemo(() => {
    try {
      return new PublicKey(MERCHANT_WALLET);
    } catch {
      return null;
    }
  }, []);

  const parsedAmount = parseFloat(amount);
  const amountValid = Number.isFinite(parsedAmount) && parsedAmount > 0;

  const reset = useCallback(() => {
    setPhase("idle");
    setError(null);
    setResult(null);
  }, []);

  const onPay = useCallback(async () => {
    setError(null);
    setResult(null);

    if (!merchantPk) {
      setError("Invalid merchant wallet configuration.");
      setPhase("error");
      return;
    }

    if (!amountValid) {
      setError("Enter a valid amount greater than zero.");
      setPhase("error");
      return;
    }

    if (!connected || !publicKey) {
      setVisible(true);
      return;
    }

    try {
      setPhase("preparing");
      const intent = await createPaymentIntent({
        merchantId: MERCHANT_ID,
        amount: parsedAmount,
      });

      setPhase("signing");
      let signature: string;
      try {
        signature = await sendSolPayment({
          connection,
          from: publicKey,
          to: merchantPk,
          solAmount: parsedAmount,
          sendTransaction,
        });
      } catch (walletErr) {
        const friendly = getWalletTransactionMessage(walletErr);
        toast.error("Wallet", { description: friendly });
        setError(friendly);
        setPhase("error");
        return;
      }

      setPhase("finalizing");
      const verified = await verifyPayment({
        signature,
        intentId: intent.id,
      });
      setResult(verified);

      if (verified.status === "SUCCESS") {
        setPhase("success");
        toast.success("Payment verified", {
          description: "On-chain settlement completed.",
        });
      } else {
        const msg =
          verified.status === "FAILED"
            ? "On-chain verification did not match this intent."
            : `Unexpected status: ${verified.status}`;
        toast.error("Verification", { description: msg });
        setError(msg);
        setPhase("error");
      }
    } catch (e) {
      const message = e instanceof Error ? e.message : "Something went wrong.";
      toast.error("Payment", { description: message });
      setError(message);
      setPhase("error");
    }
  }, [
    amountValid,
    connected,
    connection,
    merchantPk,
    parsedAmount,
    publicKey,
    sendTransaction,
    setVisible,
  ]);

  const busy =
    phase === "preparing" || phase === "signing" || phase === "finalizing";

  return (
    <div className="relative overflow-hidden rounded-3xl border border-white/[0.08] bg-white/[0.03] p-6 shadow-[0_8px_60px_rgba(0,0,0,0.45)] backdrop-blur-xl sm:p-8">
      <div className="pointer-events-none absolute -right-20 -top-20 h-48 w-48 rounded-full bg-[#84A794]/10 blur-3xl" />

      <div className="relative z-10">
        <h2 className="font-mulish text-lg font-semibold text-white">Checkout</h2>
        <p className="mt-1 text-sm text-white/45">Pay with Solana — we abstract the intent.</p>

        <label className="mt-8 block text-xs font-medium uppercase tracking-wider text-white/40">
          Amount
        </label>
        <div className="mt-2 flex items-center gap-3 rounded-2xl border border-white/[0.08] bg-[#020202]/40 px-4 py-3 backdrop-blur-sm">
          <input
            type="number"
            min={0}
            step="any"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full bg-transparent font-mulish text-2xl font-semibold text-white outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
            disabled={busy}
          />
          <span className="text-sm font-medium text-[#84A794]">SOL</span>
        </div>

        <div className="mt-6 space-y-3 rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-white/45">Source</span>
            <span className="font-medium text-[#B2C8BC]">SOL</span>
          </div>
          <div className="h-px bg-white/[0.06]" />
          <div className="flex items-center justify-between text-sm">
            <span className="text-white/45">Target</span>
            <span className="font-medium text-[#84A794]">USDC</span>
          </div>
        </div>

        {error ? (
          <p className="mt-4 rounded-xl border border-red-500/20 bg-red-500/10 px-3 py-2 text-sm text-red-200/90">
            {error}
          </p>
        ) : null}

        <AnimatePresence mode="wait">
          {phase === "preparing" ? (
            <motion.div key="prep" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <SageSpinner label="Creating payment intent…" />
            </motion.div>
          ) : null}
          {phase === "signing" ? (
            <motion.div key="sign" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <SageSpinner label="Approve in your wallet…" />
            </motion.div>
          ) : null}
          {phase === "finalizing" ? (
            <motion.div key="fin" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <SageSpinner label="Finalizing on-chain…" />
            </motion.div>
          ) : null}
        </AnimatePresence>

        <button
          type="button"
          onClick={onPay}
          disabled={busy || !amountValid}
          className="mt-6 w-full rounded-2xl bg-gradient-to-r from-[#84A794] to-[#B2C8BC] py-3.5 text-center font-mulish text-sm font-semibold text-[#020202] shadow-[0_0_28px_rgba(132,167,148,0.35)] transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {connected ? "Pay Now" : "Connect wallet to pay"}
        </button>

        {phase === "error" ? (
          <button
            type="button"
            onClick={reset}
            className="mt-3 w-full rounded-xl border border-white/[0.1] py-2.5 text-sm text-white/70 transition hover:bg-white/[0.05]"
          >
            Try again
          </button>
        ) : null}
      </div>

      <AnimatePresence>
        {phase === "success" && result ? (
          <SuccessCelebration amount={result.amount} onDismiss={reset} />
        ) : null}
      </AnimatePresence>
    </div>
  );
}
