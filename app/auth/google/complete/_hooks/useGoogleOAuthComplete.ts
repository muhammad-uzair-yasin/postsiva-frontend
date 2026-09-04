"use client";

import { useOAuthComplete } from "@/lib/auth/useOAuthComplete";

export function useGoogleOAuthComplete(): {
  phase: "loading" | "error";
  message: string | null;
} {
  return useOAuthComplete({
    providerLabel: "Google",
    invalidMessage: "Google sign-in did not return a valid session. Try again.",
    errorMessage: "Could not finish Google sign-in.",
  });
}
