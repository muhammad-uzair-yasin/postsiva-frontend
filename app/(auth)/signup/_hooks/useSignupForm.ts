"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

import {
  fetchWorkspacesForSession,
  signupAccount,
} from "@/lib/auth/authApi";
import { getPostAuthPath } from "@/lib/auth/getPostAuthPath";
import { getPasswordPolicyError } from "@/lib/auth/passwordPolicy";
import { isOnboardingComplete } from "@/lib/auth/onboarding";
import {
  getStoredActiveWorkspaceId,
  saveLoginSession,
  setActiveWorkspaceId,
} from "@/lib/auth/session";
import {
  detectBrowserPublicLocale,
  readStoredPublicLocale,
} from "@/lib/i18n/publicLocaleStorage";

import type { SignupFormHookValue } from "../_types";

const REF_STORAGE_KEY = "postsiva_referral_ref";

export function useSignupForm(): SignupFormHookValue {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [referralCode, setReferralCode] = useState("");
  const [firstName, setFirstName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fromQuery = (searchParams.get("ref") || "").trim();
    if (fromQuery) {
      sessionStorage.setItem(REF_STORAGE_KEY, fromQuery);
      setReferralCode(fromQuery);
      return;
    }
    setReferralCode((sessionStorage.getItem(REF_STORAGE_KEY) || "").trim());
  }, [searchParams]);

  const onSubmit = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      setError(null);
      if (!termsAccepted) {
        setError("Please accept the terms to continue.");
        return;
      }
      const name = firstName.trim();
      if (!name) {
        setError("Please enter your first name.");
        return;
      }
      const passwordError = getPasswordPolicyError(password);
      if (passwordError) {
        setError(passwordError);
        return;
      }
      setIsLoading(true);
      try {
        const locale =
          readStoredPublicLocale() ?? detectBrowserPublicLocale();
        const payload = await signupAccount({
          email,
          password,
          fullName: name,
          referralCode: referralCode || undefined,
          locale,
        });
        const workspaces = isOnboardingComplete(payload.user)
          ? await fetchWorkspacesForSession(payload.access_token)
          : [];
        saveLoginSession({ ...payload, workspaces });
        if (workspaces[0]?.id) {
          setActiveWorkspaceId(workspaces[0].id);
        }
        router.replace(
          getPostAuthPath(payload.user, {
            nextPath: searchParams.get("next"),
            activeWorkspaceId: getStoredActiveWorkspaceId(),
          }),
        );
      } catch (err) {
        setError(err instanceof Error ? err.message : "Signup failed");
      } finally {
        setIsLoading(false);
      }
    },
    [email, firstName, password, termsAccepted, referralCode, router, searchParams],
  );

  return {
    firstName,
    setFirstName,
    email,
    setEmail,
    password,
    setPassword,
    termsAccepted,
    setTermsAccepted,
    error,
    isLoading,
    onSubmit,
  };
}
