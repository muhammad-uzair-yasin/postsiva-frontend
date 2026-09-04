"use client";

import { usePathname } from "next/navigation";

import { useWorkspaceLayout } from "../_context/WorkspaceLayoutContext";
import { WorkspaceSidebar } from "./WorkspaceSidebar";
import { WorkspaceEmailVerificationBanner } from "./WorkspaceEmailVerificationBanner";
import { WorkspaceFirstAccountBanner } from "./WorkspaceFirstAccountBanner";
import { WorkspacePastDueBanner } from "./WorkspacePastDueBanner";
import { WorkspaceShellHeader } from "./shell/WorkspaceShellHeader";
import { useWorkspaceHeaderAccounts } from "./WorkspaceHeaderAccountsProvider";
import { isOnboardingRoute } from "@/lib/auth/workspaceOnboarding";
import { shouldShowFirstAccountBanner } from "@/lib/workspace/firstAccountBanner";

export function WorkspaceLayoutShell({ children }: { children: React.ReactNode }) {
  const { sidebarExpanded } = useWorkspaceLayout();
  const connectionState = useWorkspaceHeaderAccounts();
  const pathname = usePathname();

  const isWorkspaceSelection = pathname.startsWith("/workspaces");
  const isOnboarding = isOnboardingRoute(pathname);
  const isBareShell = isWorkspaceSelection || isOnboarding;
  const showFirstAccountBanner = shouldShowFirstAccountBanner({
    isWorkspaceSelection: isBareShell,
    isLoading: connectionState.isConnectGateLoading,
    profilesError: connectionState.profilesError,
    oauthStatusKnown: connectionState.oauthTokenStatus !== null,
    hasAnySocialConnection: connectionState.hasAnySocialConnection,
    pathname,
  });

  if (!isBareShell) {
    return (
      <div className="app-viewport flex h-dvh max-h-dvh max-w-full flex-col overflow-hidden">
        <WorkspaceShellHeader />

        <div className="flex min-h-0 min-w-0 max-w-full flex-1 overflow-hidden">
          <WorkspaceSidebar />

          <div
            className={[
              "flex min-h-0 min-w-0 max-w-full flex-1 flex-col overflow-hidden transition-[margin] duration-300 ease-in-out",
              sidebarExpanded ? "lg:ml-64" : "lg:ml-20",
            ].join(" ")}
          >
            <main className="flex min-h-0 min-w-0 max-w-full flex-1 flex-col overflow-hidden">
              <WorkspaceEmailVerificationBanner />
              <WorkspacePastDueBanner />
              {showFirstAccountBanner ? <WorkspaceFirstAccountBanner /> : null}
              <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
                {children}
              </div>
            </main>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="flex min-h-full flex-col"
      style={{ paddingTop: "var(--workspace-first-account-banner-height, 0px)" }}
    >
      {children}
    </div>
  );
}
