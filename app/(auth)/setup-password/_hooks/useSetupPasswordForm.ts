"use client";

import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";

import { fetchWorkspacesForSession, setupPassword } from "@/lib/auth/authApi";
import { getPasswordPolicyError } from "@/lib/auth/passwordPolicy";
import {
  consumePostAuthNextPath,
  getPostAuthPath,
} from "@/lib/auth/getPostAuthPath";
import {
  getStoredAccessToken,
  getStoredActiveWorkspaceId,
  setActiveWorkspaceId,
  setStoredUser,
  setStoredWorkspaces,
} from "@/lib/auth/session";
import { isOnboardingComplete } from "@/lib/auth/onboarding";

export function useSetupPasswordForm(): {
  password: string;
  setPassword: (v: string) => void;
  confirmPassword: string;
  setConfirmPassword: (v: string) => void;
  error: string | null;
  isLoading: boolean;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => Promise<void>;
} {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const onSubmit = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      setError(null);
      const passwordError = getPasswordPolicyError(password);
      if (passwordError) {
        setError(passwordError);
        return;
      }
      if (password !== confirmPassword) {
        setError("Passwords do not match.");
        return;
      }
      const token = getStoredAccessToken()?.trim();
      if (!token) {
        router.replace("/login");
        return;
      }
      setIsLoading(true);
      try {
        const result = await setupPassword(token, password, confirmPassword);
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
        setError(err instanceof Error ? err.message : "Could not save password.");
      } finally {
        setIsLoading(false);
      }
    },
    [confirmPassword, password, router],
  );

  return {
    password,
    setPassword,
    confirmPassword,
    setConfirmPassword,
    error,
    isLoading,
    onSubmit,
  };
}
