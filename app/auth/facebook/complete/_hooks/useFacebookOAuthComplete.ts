"use client";

import { useOAuthComplete } from "@/lib/auth/useOAuthComplete";

export function useFacebookOAuthComplete(): {
  phase: "loading" | "error";
  message: string | null;
} {
  return useOAuthComplete({
    providerLabel: "Facebook",
    invalidMessage: "Facebook sign-in did not return a valid session. Try again.",
    errorMessage: "Could not finish Facebook sign-in.",
  });
}
