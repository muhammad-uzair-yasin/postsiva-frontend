"use client";

import { useOAuthComplete } from "@/lib/auth/useOAuthComplete";

export function useMicrosoftOAuthComplete(): {
  phase: "loading" | "error";
  message: string | null;
} {
  return useOAuthComplete({
    providerLabel: "Microsoft",
    invalidMessage: "Microsoft sign-in did not return a valid session. Try again.",
    errorMessage: "Could not finish Microsoft sign-in.",
  });
}
