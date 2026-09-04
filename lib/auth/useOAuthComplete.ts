"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

import {
  fetchCurrentUser,
  fetchWorkspacesForSession,
} from "@/lib/auth/authApi";
import {
  consumePostAuthNextPath,
  getPostAuthPath,
} from "@/lib/auth/getPostAuthPath";
import { saveLoginSession } from "@/lib/auth/session";
import { isOnboardingComplete } from "@/lib/auth/onboarding";

type Phase = "loading" | "error";

type UseOAuthCompleteOptions = {
  providerLabel: string;
  invalidMessage: string;
  errorMessage: string;
};

export function useOAuthComplete({
  providerLabel,
  invalidMessage,
  errorMessage,
}: UseOAuthCompleteOptions): {
  phase: Phase;
  message: string | null;
} {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const success = searchParams.get("success");
  const serverError = searchParams.get("error");
  const [phase, setPhase] = useState<Phase>("loading");
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!token || success !== "true") {
      const id = window.setTimeout(() => {
        setPhase("error");
        // Prefer the human-readable reason the backend sent (e.g. no email);
        // fall back to the generic message when none was provided.
        setMessage(serverError?.trim() || invalidMessage);
      }, 0);
      return () => window.clearTimeout(id);
    }

    const ac = new AbortController();

    (async () => {
      try {
        const user = await fetchCurrentUser(token, ac.signal);
        const workspaces = isOnboardingComplete(user)
          ? await fetchWorkspacesForSession(token, ac.signal)
          : [];
        saveLoginSession({
          access_token: token,
          token_type: "bearer",
          user,
          workspaces,
        });
        router.replace(
          getPostAuthPath(user, {
            nextPath: searchParams.get("next") ?? consumePostAuthNextPath(),
          }),
        );
      } catch (e) {
        if (ac.signal.aborted) {
          return;
        }
        setPhase("error");
        setMessage(
          e instanceof Error
            ? e.message
            : errorMessage.replace("{provider}", providerLabel),
        );
      }
    })();

    return () => ac.abort();
  }, [
    token,
    success,
    serverError,
    router,
    searchParams,
    providerLabel,
    invalidMessage,
    errorMessage,
  ]);

  return { phase, message };
}
