"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import {
  exchangeImpersonationCode,
  fetchWorkspacesForSession,
} from "@/lib/auth/authApi";
import { getPostAuthPath } from "@/lib/auth/getPostAuthPath";
import { isOnboardingComplete } from "@/lib/auth/onboarding";
import {
  saveLoginSession,
  STORAGE_KEY_LAST_WORKSPACE_ID,
} from "@/lib/auth/session";
import type { LoginSuccessPayload } from "@/lib/auth/types";

/** One exchange per code — survives React Strict Mode double-mount. */
const exchangeByCode = new Map<string, Promise<LoginSuccessPayload>>();

function exchangeOnce(code: string): Promise<LoginSuccessPayload> {
  const existing = exchangeByCode.get(code);
  if (existing) return existing;
  const pending = exchangeImpersonationCode(code).catch((err) => {
    exchangeByCode.delete(code);
    throw err;
  });
  exchangeByCode.set(code, pending);
  return pending;
}

export function useImpersonateHandoff(): {
  status: "loading" | "error";
  error: string | null;
} {
  const router = useRouter();
  const searchParams = useSearchParams();
  const code = searchParams.get("code")?.trim() ?? "";
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<"loading" | "error">("loading");

  useEffect(() => {
    if (!code) {
      setStatus("error");
      setError("Missing impersonation code.");
      return;
    }
    let cancelled = false;
    void (async () => {
      try {
        const payload = await exchangeOnce(code);
        if (cancelled) return;
        const workspaces = isOnboardingComplete(payload.user)
          ? await fetchWorkspacesForSession(payload.access_token)
          : [];
        if (cancelled) return;
        // Do not restore admin's last workspace when switching identity.
        window.localStorage.removeItem(STORAGE_KEY_LAST_WORKSPACE_ID);
        saveLoginSession({ ...payload, workspaces });
        router.replace(getPostAuthPath(payload.user));
      } catch (err) {
        if (cancelled) return;
        setStatus("error");
        setError(err instanceof Error ? err.message : "Impersonation failed.");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [router, code]);

  return { status, error };
}
