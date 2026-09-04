"use client";

import { useOAuthComplete } from "@/lib/auth/useOAuthComplete";

export function useTiktokOAuthComplete(): {
  phase: "loading" | "error";
  message: string | null;
} {
  return useOAuthComplete({
    providerLabel: "TikTok",
    invalidMessage: "TikTok sign-in did not return a valid session. Try again.",
    errorMessage: "Could not finish TikTok sign-in.",
  });
}
