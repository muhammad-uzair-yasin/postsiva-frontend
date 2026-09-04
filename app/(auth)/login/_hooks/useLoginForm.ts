"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useState } from "react";

import {
  fetchWorkspacesForSession,
  loginWithPassword,
} from "@/lib/auth/authApi";
import { isOnboardingComplete } from "@/lib/auth/onboarding";
import { getPostAuthPath } from "@/lib/auth/getPostAuthPath";
import { saveLoginSession } from "@/lib/auth/session";

export function useLoginForm(): {
  email: string;
  setEmail: (v: string) => void;
  password: string;
  setPassword: (v: string) => void;
  error: string | null;
  isLoading: boolean;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => Promise<void>;
} {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const onSubmit = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      setError(null);
      setIsLoading(true);
      try {
        const payload = await loginWithPassword(email, password);
        const workspaces = isOnboardingComplete(payload.user)
          ? await fetchWorkspacesForSession(payload.access_token)
          : [];
        saveLoginSession({ ...payload, workspaces });
        router.replace(
          getPostAuthPath(payload.user, {
            nextPath: searchParams.get("next"),
          }),
        );
      } catch (err) {
        setError(err instanceof Error ? err.message : "Login failed");
      } finally {
        setIsLoading(false);
      }
    },
    [email, password, router, searchParams],
  );

  return {
    email,
    setEmail,
    password,
    setPassword,
    error,
    isLoading,
    onSubmit,
  };
}
