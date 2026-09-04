"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useState } from "react";

import { resetPasswordWithToken } from "@/lib/auth/authApi";
import { getPasswordPolicyError } from "@/lib/auth/passwordPolicy";

import type { ResetPasswordGate } from "../_types";
import { useResetPasswordGate } from "./useResetPasswordGate";

export function useResetPasswordForm(): {
  gate: ResetPasswordGate;
  password: string;
  setPassword: (v: string) => void;
  confirmPassword: string;
  setConfirmPassword: (v: string) => void;
  error: string | null;
  isLoading: boolean;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => Promise<void>;
} {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const gate = useResetPasswordGate(token);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const onSubmit = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      const t = token?.trim();
      if (!t) {
        return;
      }
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
      setIsLoading(true);
      try {
        await resetPasswordWithToken(t, password);
        router.push("/login?reset=1");
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Could not reset password.",
        );
      } finally {
        setIsLoading(false);
      }
    },
    [token, password, confirmPassword, router],
  );

  return {
    gate,
    password,
    setPassword,
    confirmPassword,
    setConfirmPassword,
    error,
    isLoading,
    onSubmit,
  };
}
