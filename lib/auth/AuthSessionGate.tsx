"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { getOnboardingPath } from "@/lib/auth/onboarding";
import { getPostAuthPath } from "@/lib/auth/getPostAuthPath";
import {
  clearLoginSession,
  getPendingSessionExpiry,
  getStoredAccessToken,
  getStoredActiveWorkspaceId,
  getStoredUser,
} from "@/lib/auth/session";

const ONBOARDING_PATHS = new Set(["/setup-password", "/verify-otp"]);

export function AuthSessionGate({
  children,
}: {
  children: React.ReactNode;
}): React.ReactElement {
  const router = useRouter();
  const pathname = usePathname();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const token = getStoredAccessToken()?.trim();
    if (!token) {
      if (getPendingSessionExpiry()?.loginUrl) {
        const id = window.setTimeout(() => setChecking(false), 0);
        return () => window.clearTimeout(id);
      }
      const currentPath = `${window.location.pathname}${window.location.search}`;
      router.replace(`/login?${new URLSearchParams({ next: currentPath }).toString()}`);
      return;
    }
    const user = getStoredUser();
    const next = getOnboardingPath(user);
    if (next && pathname !== next) {
      router.replace(next);
      return;
    }
    const id = window.setTimeout(() => setChecking(false), 0);
    return () => window.clearTimeout(id);
  }, [pathname, router]);

  return checking ? <></> : <>{children}</>;
}

export function AuthenticatedAuthPageGate({
  children,
}: {
  children: React.ReactNode;
}): React.ReactElement {
  const router = useRouter();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    if (new URLSearchParams(window.location.search).get("session") === "expired") {
      clearLoginSession();
      const id = window.setTimeout(() => setChecking(false), 0);
      return () => window.clearTimeout(id);
    }
    const token = getStoredAccessToken()?.trim();
    const user = getStoredUser();
    if (token && user) {
      router.replace(
        getPostAuthPath(user, {
          activeWorkspaceId: getStoredActiveWorkspaceId(),
        }),
      );
      return;
    }
    const id = window.setTimeout(() => setChecking(false), 0);
    return () => window.clearTimeout(id);
  }, [router]);

  return checking ? <></> : <>{children}</>;
}

export function AuthOnboardingGate({
  children,
  requiredPath,
}: {
  children: React.ReactNode;
  requiredPath: "/setup-password" | "/verify-otp";
}): React.ReactElement {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const token = getStoredAccessToken()?.trim();
    if (!token) {
      router.replace("/login");
      return;
    }
    const user = getStoredUser();
    const next = getOnboardingPath(user);
    if (!next) {
      router.replace("/dashboard");
      return;
    }
    if (next !== requiredPath && pathname !== next) {
      router.replace(next);
    }
  }, [pathname, requiredPath, router]);

  return <>{children}</>;
}

export { ONBOARDING_PATHS };
