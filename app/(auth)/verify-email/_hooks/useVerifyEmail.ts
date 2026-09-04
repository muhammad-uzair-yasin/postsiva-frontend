"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

import { verifyEmailWithToken } from "@/lib/auth/authApi";

export type VerifyEmailStatus = "loading" | "success" | "error";

export function useVerifyEmail(): {
  status: VerifyEmailStatus;
  message: string;
} {
  const searchParams = useSearchParams();
  const token = searchParams.get("token")?.trim() ?? "";
  const [status, setStatus] = useState<VerifyEmailStatus>(() =>
    token ? "loading" : "error",
  );
  const [message, setMessage] = useState(() =>
    token ? "" : "Missing verification token.",
  );

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setMessage("Missing verification token.");
      return;
    }
    const ac = new AbortController();
    void verifyEmailWithToken(token, ac.signal)
      .then((res) => {
        setStatus("success");
        setMessage(res.message || "Email verified successfully.");
      })
      .catch((err: unknown) => {
        if (err instanceof DOMException && err.name === "AbortError") {
          return;
        }
        setStatus("error");
        setMessage(
          err instanceof Error ? err.message : "Verification failed.",
        );
      });
    return () => ac.abort();
  }, [token]);

  return { status, message };
}
