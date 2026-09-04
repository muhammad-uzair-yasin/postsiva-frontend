"use client";

import { useOAuthComplete } from "@/lib/auth/useOAuthComplete";

export function useLinkedInOAuthComplete(): {
  phase: "loading" | "error";
  message: string | null;
} {
  return useOAuthComplete({
    providerLabel: "LinkedIn",
    invalidMessage: "LinkedIn sign-in did not return a valid session. Try again.",
    errorMessage: "Could not finish LinkedIn sign-in.",
  });
}
