"use client";

import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";
import { PublicKey } from "@solana/web3.js";
import { useQueryClient } from "@tanstack/react-query";
import { AnimatePresence, motion } from "framer-motion";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import {
  useAccount,
  useChainId,
  useConnect,
  useSendTransaction,
  useSwitchChain,
  useWriteContract,
} from "wagmi";
import { injected } from "wagmi/connectors";
import { sepolia } from "viem/chains";

import { createPaymentIntent, verifyPayment } from "@/lib/api";
import {
  DEVNET_USDC_MINT,
  EIP155_SEPOLIA,
  MERCHANT_ID,
  MERCHANT_WALLET,
  SEPOLIA_ERC20_USDC,
} from "@/lib/constants";
import { assertEvmAddress, buildErc20TransferCall, buildNativeTransferTx } from "@/lib/evm";
import { sendSolPayment, sendSplTokenPayment } from "@/lib/solana";
import { getWalletTransactionMessage } from "@/lib/wallet-errors";
import type { SerializedPaymentIntent } from "@/types/payment";

export type PaymentWidgetProps = {
  variant?: "default" | "modal";
};

type FlowPhase =
  | "idle"
  | "preparing"
  | "signing"
  | "finalizing"
  | "success"
  | "error";

type NetworkTab = "solana" | "evm";
type SolAsset = "SOL" | "USDC";
type EvmAsset = "ETH" | "USDC";

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

function ModalErrorOverlay({ message }: { message: string }) {
  return (
    <motion.div
      className="absolute inset-0 z-20 flex flex-col items-center justify-center overflow-hidden rounded-3xl bg-[#020202]/92 backdrop-blur-md"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="flex h-16 w-16 items-center justify-center rounded-full border-2 border-red-500/45 bg-red-500/10 text-2xl font-light text-red-400"
        initial={{ scale: 0.5, rotate: -12 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: "spring", stiffness: 420, damping: 22 }}
        aria-hidden
      >
        ✕
      </motion.div>
      <motion.p
        className="mt-4 max-w-[min(92%,300px)] px-3 text-center text-sm leading-snug text-red-200/95"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.08 }}
      >
        {message}
      </motion.p>
    </motion.div>
  );
}

function SuccessCelebration({
  amount,
  currency,
  onDismiss,
  mode = "full",
}: {
  amount: string;
  currency: string;
  onDismiss: () => void;
  mode?: "full" | "compact";
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

  if (mode === "compact") {
    return (
      <motion.div
        className="absolute inset-0 z-20 flex flex-col items-center justify-center overflow-hidden rounded-3xl bg-[#020202]/90 backdrop-blur-md"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          className="relative flex h-16 w-16 items-center justify-center rounded-full border border-emerald-500/40 bg-emerald-500/10 text-3xl text-emerald-400 shadow-[0_0_32px_rgba(52,211,153,0.28)]"
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 320, damping: 18 }}
        >
          <motion.span
            initial={{ scale: 0, rotate: -20 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 400, damping: 15, delay: 0.06 }}
            aria-hidden
          >
            ✓
          </motion.span>
        </motion.div>
        <motion.p
          className="mt-5 font-mulish text-lg font-semibold text-white"
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.12 }}
        >
          Successful
        </motion.p>
      </motion.div>
    );
  }

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
        {amount} {currency} · verified on-chain
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

export function PaymentWidget({ variant = "default" }: PaymentWidgetProps) {
  const queryClient = useQueryClient();
  const { connection } = useConnection();
  const { publicKey, sendTransaction, connected } = useWallet();
  const { setVisible } = useWalletModal();

  const { address: evmAddress, isConnected: evmConnected } = useAccount();
  const chainId = useChainId();
  const { switchChainAsync } = useSwitchChain();
  const { sendTransactionAsync } = useSendTransaction();
  const { writeContractAsync } = useWriteContract();
  const { connectAsync, isPending: evmConnectPending } = useConnect();

  const [network, setNetwork] = useState<NetworkTab>("solana");
  const [amount, setAmount] = useState("0.1");
  const [recipientInput, setRecipientInput] = useState(MERCHANT_WALLET);
  const [solAsset, setSolAsset] = useState<SolAsset>("SOL");
  const [evmAsset, setEvmAsset] = useState<EvmAsset>("ETH");
  const [phase, setPhase] = useState<FlowPhase>("idle");
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<SerializedPaymentIntent | null>(null);

  const recipientPk = useMemo(() => {
    try {
      return new PublicKey(recipientInput.trim());
    } catch {
      return null;
    }
  }, [recipientInput]);

  const evmRecipient = useMemo(() => {
    try {
      return assertEvmAddress(recipientInput);
    } catch {
      return null;
    }
  }, [recipientInput]);

  const usdcMintPk = useMemo(() => {
    try {
      return new PublicKey(DEVNET_USDC_MINT);
    } catch {
      return null;
    }
  }, []);

  const parsedAmount = parseFloat(amount);
  const amountValid = Number.isFinite(parsedAmount) && parsedAmount > 0;
  const recipientValidSol = recipientPk !== null;
  const recipientValidEvm = evmRecipient !== null;
  const recipientValid = network === "solana" ? recipientValidSol : recipientValidEvm;

  const evmUsdcConfigured = SEPOLIA_ERC20_USDC.trim().length > 0;

  const reset = useCallback(() => {
    setPhase("idle");
    setError(null);
    setResult(null);
  }, []);

  useEffect(() => {
    if (variant !== "modal" || phase !== "success") return;
    const t = window.setTimeout(() => reset(), 2600);
    return () => clearTimeout(t);
  }, [variant, phase, reset]);

  useEffect(() => {
    if (variant !== "modal" || phase !== "error" || !error) return;
    const t = window.setTimeout(() => reset(), 3200);
    return () => clearTimeout(t);
  }, [variant, phase, error, reset]);

  const ensureEvmChain = useCallback(async () => {
    if (chainId !== sepolia.id) {
      await switchChainAsync({ chainId: sepolia.id });
    }
  }, [chainId, switchChainAsync]);

  const onPaySolana = useCallback(async () => {
    if (!recipientValidSol || !recipientPk) {
      setError("Enter a valid Solana recipient address.");
      setPhase("error");
      return;
    }
    if (solAsset === "USDC" && !usdcMintPk) {
      setError("Invalid USDC mint configuration.");
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
      const treasuryAddress = recipientPk.toBase58();
      const intentBody =
        solAsset === "SOL"
          ? {
              merchantId: MERCHANT_ID,
              amount: parsedAmount,
              chainId: "solana:devnet",
              assetKind: "NATIVE_SOL",
              treasuryAddress,
            }
          : {
              merchantId: MERCHANT_ID,
              amount: parsedAmount,
              chainId: "solana:devnet",
              assetKind: "SPL_TOKEN",
              mintAddress: DEVNET_USDC_MINT,
              treasuryAddress,
            };

      const intent = await createPaymentIntent(intentBody);

      setPhase("signing");
      let signature: string;
      try {
        if (solAsset === "SOL") {
          signature = await sendSolPayment({
            connection,
            from: publicKey,
            to: recipientPk,
            solAmount: parsedAmount,
            sendTransaction,
          });
        } else {
          signature = await sendSplTokenPayment({
            connection,
            from: publicKey,
            toOwner: recipientPk,
            mint: usdcMintPk!,
            humanAmount: parsedAmount,
            sendTransaction,
          });
        }
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
        void queryClient.invalidateQueries({ queryKey: ["payments"] });
        void queryClient.invalidateQueries({ queryKey: ["payment-metrics"] });
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
    queryClient,
    amountValid,
    connected,
    connection,
    parsedAmount,
    publicKey,
    recipientPk,
    recipientValidSol,
    sendTransaction,
    setVisible,
    solAsset,
    usdcMintPk,
  ]);

  const onPayEvm = useCallback(async () => {
    if (!recipientValidEvm || !evmRecipient) {
      setError("Enter a valid EVM treasury address (0x…).");
      setPhase("error");
      return;
    }
    if (evmAsset === "USDC" && !evmUsdcConfigured) {
      setError(
        "ERC-20 USDC is not configured. Set NEXT_PUBLIC_SEPOLIA_USDC_MINT and allowlist it in the backend.",
      );
      setPhase("error");
      return;
    }
    if (!amountValid) {
      setError("Enter a valid amount greater than zero.");
      setPhase("error");
      return;
    }

    if (!evmConnected || !evmAddress) {
      try {
        await connectAsync({ chainId: sepolia.id, connector: injected() });
        toast.message("Wallet connected", { description: "Tap Pay again to send." });
      } catch (e) {
        const message = e instanceof Error ? e.message : "Could not connect wallet.";
        toast.error("Wallet", { description: message });
      }
      return;
    }

    try {
      setPhase("preparing");

      const treasuryAddress = evmRecipient;
      const intentBody =
        evmAsset === "ETH"
          ? {
              merchantId: MERCHANT_ID,
              amount: parsedAmount,
              chainId: EIP155_SEPOLIA,
              assetKind: "EVM_NATIVE",
              treasuryAddress,
            }
          : {
              merchantId: MERCHANT_ID,
              amount: parsedAmount,
              chainId: EIP155_SEPOLIA,
              assetKind: "EVM_ERC20",
              mintAddress: SEPOLIA_ERC20_USDC.trim().toLowerCase(),
              treasuryAddress,
            };

      const intent = await createPaymentIntent(intentBody);

      setPhase("signing");
      await ensureEvmChain();

      let txHash: `0x${string}`;

      if (evmAsset === "ETH") {
        const tx = buildNativeTransferTx(treasuryAddress, String(parsedAmount));
        txHash = await sendTransactionAsync({
          chainId: sepolia.id,
          ...tx,
        });
      } else {
        const token = SEPOLIA_ERC20_USDC.trim().toLowerCase() as `0x${string}`;
        const call = buildErc20TransferCall(token, treasuryAddress, String(parsedAmount), 6);
        txHash = await writeContractAsync({
          chainId: sepolia.id,
          ...call,
        });
      }

      setPhase("finalizing");
      const verified = await verifyPayment({
        signature: txHash,
        intentId: intent.id,
      });
      setResult(verified);

      if (verified.status === "SUCCESS") {
        void queryClient.invalidateQueries({ queryKey: ["payments"] });
        void queryClient.invalidateQueries({ queryKey: ["payment-metrics"] });
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
    queryClient,
    amountValid,
    connectAsync,
    ensureEvmChain,
    evmAddress,
    evmAsset,
    evmConnected,
    evmRecipient,
    evmUsdcConfigured,
    parsedAmount,
    recipientValidEvm,
    sendTransactionAsync,
    writeContractAsync,
  ]);

  const onPay = useCallback(() => {
    if (network === "solana") {
      void onPaySolana();
    } else {
      void onPayEvm();
    }
  }, [network, onPayEvm, onPaySolana]);

  const busy =
    phase === "preparing" || phase === "signing" || phase === "finalizing";

  const payLabel = useMemo(() => {
    if (network === "solana") {
      return connected ? "Pay now" : "Connect Solana wallet";
    }
    if (evmConnectPending) return "Connecting…";
    return evmConnected ? "Pay now" : "Connect Ethereum wallet";
  }, [connected, evmConnectPending, evmConnected, network]);

  const walletConnected = network === "solana" ? connected : evmConnected;

  const assetLabel = network === "solana" ? solAsset : evmAsset;

  const shellClass =
    variant === "modal"
      ? "relative overflow-hidden rounded-2xl border border-white/[0.06] bg-[#080808]/90 p-5 shadow-none backdrop-blur-xl sm:p-6"
      : "relative overflow-hidden rounded-3xl border border-white/[0.08] bg-white/[0.03] p-6 shadow-[0_8px_60px_rgba(0,0,0,0.45)] backdrop-blur-xl sm:p-8";

  return (
    <div className={shellClass}>
      <div className="pointer-events-none absolute -right-20 -top-20 h-48 w-48 rounded-full bg-[#84A794]/10 blur-3xl" />

      <div className="relative z-10">
        <h2 className="font-mulish text-lg font-semibold text-white">Checkout</h2>
        <p className="mt-1 text-sm text-white/45">
          Multi-chain intents — Solana Devnet or Sepolia (EIP-155).
        </p>

        <div className="mt-6 flex gap-2 rounded-2xl border border-white/[0.08] bg-[#020202]/40 p-1">
          {(["solana", "evm"] as const).map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => {
                setNetwork(n);
                setRecipientInput(n === "solana" ? MERCHANT_WALLET : "");
              }}
              disabled={busy}
              className={`flex-1 rounded-xl py-2.5 text-sm font-medium transition ${
                network === n
                  ? "bg-[#84A794]/25 text-white shadow-[0_0_20px_rgba(132,167,148,0.2)]"
                  : "text-white/45 hover:text-white/70"
              }`}
            >
              {n === "solana" ? "Solana" : "EVM (Sepolia)"}
            </button>
          ))}
        </div>

        <label className="mt-6 block text-xs font-medium uppercase tracking-wider text-white/40">
          Recipient address
        </label>
        <input
          type="text"
          value={recipientInput}
          onChange={(e) => setRecipientInput(e.target.value)}
          disabled={busy}
          spellCheck={false}
          className="mt-2 w-full rounded-2xl border border-white/[0.08] bg-[#020202]/40 px-4 py-3 font-mono text-xs text-white outline-none placeholder:text-white/25 focus:border-[#B2C8BC]/35"
          placeholder={
            network === "solana" ? "Solana address (base58)" : "EVM treasury (0x…)"
          }
        />
        {!recipientValid ? (
          <p className="mt-2 text-xs text-amber-200/80">
            {network === "solana"
              ? "Enter a valid Solana public key."
              : "Enter a valid EVM address (checksummed 0x…)."}
          </p>
        ) : null}

        {network === "evm" && !evmUsdcConfigured ? (
          <p className="mt-2 text-xs text-white/35">
            ERC-20 mode needs <code className="text-white/60">NEXT_PUBLIC_SEPOLIA_USDC_MINT</code>{" "}
            and an allowlisted token for this merchant.
          </p>
        ) : null}

        <div className="mt-6 flex gap-2 rounded-2xl border border-white/[0.08] bg-[#020202]/40 p-1">
          {network === "solana"
            ? (["SOL", "USDC"] as const).map((a) => (
                <button
                  key={a}
                  type="button"
                  onClick={() => setSolAsset(a)}
                  disabled={busy}
                  className={`flex-1 rounded-xl py-2.5 text-sm font-medium transition ${
                    solAsset === a
                      ? "bg-[#84A794]/25 text-white shadow-[0_0_20px_rgba(132,167,148,0.2)]"
                      : "text-white/45 hover:text-white/70"
                  }`}
                >
                  {a}
                </button>
              ))
            : (["ETH", "USDC"] as const).map((a) => (
                <button
                  key={a}
                  type="button"
                  onClick={() => setEvmAsset(a)}
                  disabled={busy || (a === "USDC" && !evmUsdcConfigured)}
                  className={`flex-1 rounded-xl py-2.5 text-sm font-medium transition ${
                    evmAsset === a
                      ? "bg-[#84A794]/25 text-white shadow-[0_0_20px_rgba(132,167,148,0.2)]"
                      : "text-white/45 hover:text-white/70"
                  } ${a === "USDC" && !evmUsdcConfigured ? "opacity-40" : ""}`}
                >
                  {a}
                </button>
              ))}
        </div>

        <label className="mt-6 block text-xs font-medium uppercase tracking-wider text-white/40">
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
          <span className="text-sm font-medium text-[#84A794]">{assetLabel}</span>
        </div>

        <div className="mt-6 space-y-3 rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-white/45">Network</span>
            <span className="font-medium text-[#B2C8BC]">
              {network === "solana" ? "Solana Devnet" : "Sepolia"}
            </span>
          </div>
          <div className="h-px bg-white/[0.06]" />
          <div className="flex items-center justify-between text-sm">
            <span className="text-white/45">Asset</span>
            <span className="font-medium text-[#B2C8BC]">{assetLabel}</span>
          </div>
          <div className="h-px bg-white/[0.06]" />
          <div className="flex items-center justify-between text-sm">
            <span className="text-white/45">Settlement</span>
            <span className="font-medium text-[#84A794]">Treasury (verified)</span>
          </div>
        </div>

        {error && variant === "default" ? (
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
          disabled={busy || !amountValid || !recipientValid || (network === "evm" && evmAsset === "USDC" && !evmUsdcConfigured)}
          className="mt-6 w-full rounded-2xl bg-gradient-to-r from-[#84A794] to-[#B2C8BC] py-3.5 text-center font-mulish text-sm font-semibold text-[#020202] shadow-[0_0_28px_rgba(132,167,148,0.35)] transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {payLabel}
        </button>

        {phase === "error" && variant === "default" ? (
          <button
            type="button"
            onClick={reset}
            className="mt-3 w-full rounded-xl border border-white/[0.1] py-2.5 text-sm text-white/70 transition hover:bg-white/[0.05]"
          >
            Try again
          </button>
        ) : null}

        <div className="mt-6 flex items-center justify-center gap-2 border-t border-white/[0.06] pt-5">
          <span
            className={`h-2 w-2 shrink-0 rounded-full ${walletConnected ? "bg-emerald-500 shadow-[0_0_10px_rgba(52,211,153,0.5)]" : "bg-red-500 shadow-[0_0_10px_rgba(248,113,113,0.45)]"}`}
            aria-hidden
          />
          <span
            className={`text-xs font-medium tracking-wide ${walletConnected ? "text-emerald-400" : "text-red-400"}`}
          >
            {walletConnected ? "Connected" : "Connect wallet"}
          </span>
        </div>
      </div>

      <AnimatePresence>
        {variant === "modal" && phase === "error" && error ? (
          <ModalErrorOverlay key="modal-err" message={error} />
        ) : null}
      </AnimatePresence>

      <AnimatePresence>
        {phase === "success" && result ? (
          <SuccessCelebration
            amount={result.amount}
            currency={result.currency}
            onDismiss={reset}
            mode={variant === "modal" ? "compact" : "full"}
          />
        ) : null}
      </AnimatePresence>
    </div>
  );
}
