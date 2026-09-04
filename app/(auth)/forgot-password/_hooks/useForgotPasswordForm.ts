"use client";

import { useCallback, useState } from "react";

import { requestPasswordReset } from "@/lib/auth/authApi";

export function useForgotPasswordForm(): {
  email: string;
  setEmail: (v: string) => void;
  error: string | null;
  isLoading: boolean;
  submitted: boolean;
  tryAgain: () => void;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => Promise<void>;
} {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const tryAgain = useCallback(() => {
    setSubmitted(false);
    setError(null);
  }, []);

  const onSubmit = useCallback(async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setSubmitted(false);
    const trimmed = email.trim();
    if (!trimmed) {
      setError("Please enter your email address.");
      return;
    }
    setIsLoading(true);
    try {
      await requestPasswordReset(trimmed);
      setSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setIsLoading(false);
    }
  }, [email]);

  return {
    email,
    setEmail,
    error,
    isLoading,
    submitted,
    tryAgain,
    onSubmit,
  };
}
