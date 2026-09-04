"use client";

import type { ReactNode, ReactElement } from "react";
import { usePathname } from "next/navigation";

import { useBilling } from "@/lib/billing/BillingContext";
import { isOnboardingRoute } from "@/lib/auth/workspaceOnboarding";

import { AiPipelineChatProvider } from "../ai-pipeline/_context/AiPipelineChatContext";

import { WorkspaceAgentFabDock } from "./WorkspaceAgentFabDock";

/**
 * Piva chat provider only on /ai-pipeline. FAB mounts its own provider when opened.
 */
export function WorkspaceAgentChatShell({
  children,
}: {
  children: ReactNode;
}): ReactElement {
  const { hasFeature, loading } = useBilling();
  const pathname = usePathname();
  const pivaEnabled = hasFeature("piva_agent_enabled");
  const isFullAgentPage =
    pathname === "/ai-pipeline" || pathname.startsWith("/ai-pipeline/");
  const hidePivaFab = isOnboardingRoute(pathname);

  if (loading || !pivaEnabled || hidePivaFab) {
    return <>{children}</>;
  }

  if (isFullAgentPage) {
    return <AiPipelineChatProvider>{children}</AiPipelineChatProvider>;
  }

  return (
    <>
      {children}
      <WorkspaceAgentFabDock />
    </>
  );
}
