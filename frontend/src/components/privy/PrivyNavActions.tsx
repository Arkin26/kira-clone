"use client";

import { usePrivy } from "@privy-io/react-auth";
import { useCallback } from "react";

import { PRIVY_APP_ID } from "@/lib/constants";

function PrivyNavActionsImpl() {
  const { ready, authenticated, user, login, logout } = usePrivy();

  const onClick = useCallback(() => {
    if (authenticated) {
      void logout();
    } else {
      void login();
    }
  }, [authenticated, login, logout]);

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={!ready}
      className="rounded-full border border-white/[0.08] bg-white/[0.03] px-4 py-2 text-xs font-medium text-white/85 transition hover:bg-white/[0.07] disabled:opacity-40"
    >
      {!ready ? "…" : authenticated ? `Account · ${user?.email?.address ?? "wallet"}` : "Log in"}
    </button>
  );
}

/**
 * Only mount when `NEXT_PUBLIC_PRIVY_APP_ID` is set (matches `Web3Providers` Privy shell).
 */
export function PrivyNavActions() {
  if (!PRIVY_APP_ID) {
    return null;
  }
  return <PrivyNavActionsImpl />;
}
