"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, type ReactElement, type ReactNode } from "react";

import { anyWorkspaceHasSocialConnection } from "@/lib/auth/anyWorkspaceSocialConnection";
import { fetchWorkspacesForSession } from "@/lib/auth/authApi";
import { ensureActiveWorkspaceId } from "@/lib/auth/ensureActiveWorkspace";
import {
  getStoredAccessToken,
  getStoredWorkspaces,
  setStoredWorkspaces,
} from "@/lib/auth/session";
import {
  isConnectOnboardingComplete,
  isOnboardingRoute,
  markConnectOnboardingComplete,
} from "@/lib/auth/workspaceOnboarding";

import { OnboardingGateLoadingScreen } from "../onboarding/_components/OnboardingGateLoadingScreen";
import {
  OnboardingConnectionGateProvider,
} from "../onboarding/_context/OnboardingConnectionGateContext";

function isConnectOnboardingPath(pathname: string): boolean {
  return pathname === "/onboarding/connect";
}

function isWorkspaceOnboardingPath(pathname: string): boolean {
  return pathname === "/onboarding/workspace";
}

export function WorkspaceOnboardingGate({
  children,
}: {
  children: ReactNode;
}): ReactElement {
  const pathname = usePathname();
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(() => !isWorkspaceOnboardingPath(pathname));
  const [allowed, setAllowed] = useState(() => isWorkspaceOnboardingPath(pathname));

  useEffect(() => {
    if (isWorkspaceOnboardingPath(pathname)) {
      setIsChecking(false);
      setAllowed(true);
      return;
    }

    let cancelled = false;

    const evaluate = async (): Promise<void> => {
      setIsChecking(true);
      setAllowed(false);

      const token = getStoredAccessToken()?.trim();
      if (!token) {
        if (!cancelled) {
          setIsChecking(false);
          setAllowed(true);
        }
        return;
      }

      let workspaces = getStoredWorkspaces();
      if (workspaces.length === 0) {
        try {
          const list = await fetchWorkspacesForSession(token);
          if (cancelled) {
            return;
          }
          setStoredWorkspaces(list);
          workspaces = list;
        } catch {
          /* workspace step handles empty */
        }
      }

      if (cancelled) {
        return;
      }

      if (workspaces.length === 0) {
        if (!isOnboardingRoute(pathname)) {
          router.replace("/onboarding/workspace");
        }
        return;
      }

      ensureActiveWorkspaceId();

      const anyConnected = await anyWorkspaceHasSocialConnection(
        token,
        workspaces.map((workspace) => workspace.id),
      );

      if (cancelled) {
        return;
      }

      if (anyConnected) {
        markConnectOnboardingComplete();
        if (isConnectOnboardingPath(pathname)) {
          router.replace("/dashboard");
          return;
        }
        setIsChecking(false);
        setAllowed(true);
        return;
      }

      if (!isConnectOnboardingComplete()) {
        if (!isConnectOnboardingPath(pathname)) {
          router.replace("/onboarding/connect");
          return;
        }
        setIsChecking(false);
        setAllowed(true);
        return;
      }

      setIsChecking(false);
      setAllowed(true);
    };

    void evaluate();

    return () => {
      cancelled = true;
    };
  }, [pathname, router]);

  if (isChecking || !allowed) {
    return (
      <OnboardingConnectionGateProvider isChecking={isChecking}>
        <OnboardingGateLoadingScreen />
      </OnboardingConnectionGateProvider>
    );
  }

  return (
    <OnboardingConnectionGateProvider isChecking={false}>
      {children}
    </OnboardingConnectionGateProvider>
  );
}
