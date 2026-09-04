"use client";

import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";

import {
  fetchWorkspacesForSession,
  resendOtp,
  verifyOtp,
} from "@/lib/auth/authApi";
import {
  consumePostAuthNextPath,
  getPostAuthPath,
} from "@/lib/auth/getPostAuthPath";
import {
  getStoredAccessToken,
  getStoredActiveWorkspaceId,
  getStoredUser,
  setStoredUser,
  setStoredWorkspaces,
  setActiveWorkspaceId,
} from "@/lib/auth/session";
import { isOnboardingComplete } from "@/lib/auth/onboarding";

export function useVerifyOtpForm(): {
  otp: string;
  setOtp: (v: string) => void;
  error: string | null;
  info: string | null;
  isLoading: boolean;
  isResending: boolean;
  email: string;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => Promise<void>;
  onResend: () => Promise<void>;
} {
  const router = useRouter();
  const [otp, setOtp] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const email = getStoredUser()?.email ?? "";

  const onSubmit = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      setError(null);
      const code = otp.trim();
      if (code.length !== 6) {
        setError("Enter the 6-digit code from your email.");
        return;
      }
      const token = getStoredAccessToken()?.trim();
      if (!token) {
        router.replace("/login");
        return;
      }
      setIsLoading(true);
      try {
        const result = await verifyOtp(token, code);
        setStoredUser(result.user);
        if (isOnboardingComplete(result.user)) {
          const workspaces = await fetchWorkspacesForSession(token);
          setStoredWorkspaces(workspaces);
          if (workspaces[0]?.id) setActiveWorkspaceId(workspaces[0].id);
        }
        router.replace(
          getPostAuthPath(result.user, {
            nextPath: consumePostAuthNextPath(),
            activeWorkspaceId: getStoredActiveWorkspaceId(),
          }),
        );
      } catch (err) {
        setError(err instanceof Error ? err.message : "Verification failed.");
      } finally {
        setIsLoading(false);
      }
    },
    [otp, router],
  );

  const onResend = useCallback(async () => {
    setError(null);
    setInfo(null);
    const token = getStoredAccessToken()?.trim();
    if (!token) {
      router.replace("/login");
      return;
    }
    setIsResending(true);
    try {
      const result = await resendOtp(token);
      setInfo(result.message);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not resend code.");
    } finally {
      setIsResending(false);
    }
  }, [router]);

  return {
    otp,
    setOtp,
    error,
    info,
    isLoading,
    isResending,
    email,
    onSubmit,
    onResend,
  };
}
