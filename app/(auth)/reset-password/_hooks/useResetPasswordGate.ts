"use client";

import { useEffect, useState } from "react";

import { verifyPasswordResetToken } from "@/lib/auth/authApi";

import type { ResetPasswordGate } from "../_types";

export function useResetPasswordGate(token: string | null): ResetPasswordGate {
  const [gate, setGate] = useState<ResetPasswordGate>("checking");

  useEffect(() => {
    const t = token?.trim();
    if (!t) {
      setGate("invalid");
      return;
    }
    const ac = new AbortController();
    (async () => {
      const ok = await verifyPasswordResetToken(t, ac.signal);
      if (ac.signal.aborted) {
        return;
      }
      setGate(ok ? "ready" : "invalid");
    })();
    return () => ac.abort();
  }, [token]);

  return gate;
}
