"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useState } from "react";

import {
  completeSocialProfile,
  fetchWorkspacesForSession,
} from "@/lib/auth/authApi";
import { getPostAuthPath } from "@/lib/auth/getPostAuthPath";
import { isOnboardingComplete } from "@/lib/auth/onboarding";
import {
  getStoredActiveWorkspaceId,
  saveLoginSession,
  setActiveWorkspaceId,
} from "@/lib/auth/session";

export function useFinishSignup(): {
  token: string;
  providerName: string;
  email: string;
  setEmail: (v: string) => void;
  password: string;
  setPassword: (v: string) => void;
  loading: boolean;
  error: string | null;
  submit: () => Promise<void>;
} {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";
  const provider = searchParams.get("provider") ?? "";
  const providerName = provider
    ? provider.charAt(0).toUpperCase() + provider.slice(1)
    : "your account";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = useCallback(async (): Promise<void> => {
    if (!token) {
      setError("This sign-up link is invalid or has expired. Please try again.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const payload = await completeSocialProfile({ token, email, password });
      const workspaces = isOnboardingComplete(payload.user)
        ? await fetchWorkspacesForSession(payload.access_token)
        : [];
      saveLoginSession({ ...payload, workspaces });
      if (workspaces[0]?.id) {
        setActiveWorkspaceId(workspaces[0].id);
      }
      // Unverified email → the onboarding gate routes on to /verify-otp.
      router.replace(
        getPostAuthPath(payload.user, {
          activeWorkspaceId: getStoredActiveWorkspaceId(),
        }),
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not finish sign-up.");
    } finally {
      setLoading(false);
    }
  }, [token, email, password, router]);

  return {
    token,
    providerName,
    email,
    setEmail,
    password,
    setPassword,
    loading,
    error,
    submit,
  };
}
