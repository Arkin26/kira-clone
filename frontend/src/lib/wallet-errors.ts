/**
 * Maps wallet / RPC errors to short, user-facing copy for toasts.
 */
export function getWalletTransactionMessage(error: unknown): string {
  if (error instanceof Error) {
    const m = error.message.toLowerCase();
    if (m.includes("user rejected") || m.includes("user denied") || m.includes("cancelled")) {
      return "Transaction was cancelled in your wallet.";
    }
    if (m.includes("insufficient") && m.includes("fund")) {
      return "Insufficient SOL for this transfer (include rent and fees).";
    }
    if (m.includes("blockhash") || m.includes("expired")) {
      return "Network was busy — please try again in a moment.";
    }
    if (error.message.length > 0 && error.message.length < 160) {
      return error.message;
    }
    return "Could not complete the transaction. Please try again.";
  }
  return "Could not complete the transaction. Please try again.";
}
