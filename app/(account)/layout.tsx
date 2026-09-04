import type { Metadata } from "next";

import { AppClientEffects } from "@/components/AppClientEffects";
import { MaterialSymbolsLink } from "@/components/fonts/MaterialSymbolsLink";
import { AuthSessionGate } from "@/lib/auth/AuthSessionGate";
import { BillingProvider } from "@/lib/billing/BillingContext";
import { UpgradePlanLimitProvider } from "@/lib/billing/UpgradePlanLimitProvider";
import { WorkspaceLocaleProvider } from "@/lib/i18n/WorkspaceLocaleProvider";

import { ActiveWorkspaceBootstrap } from "../(workspace)/_components/ActiveWorkspaceBootstrap";
import { WorkspaceAccountSettingsProvider } from "../(workspace)/_components/shell/WorkspaceAccountSettingsProvider";
import { WorkspaceAgentChatShell } from "../(workspace)/_components/WorkspaceAgentChatShell";
import { WorkspaceComposerModalProvider } from "../(workspace)/_components/WorkspaceComposerModalProvider";
import { WorkspaceCreateDialogProvider } from "../(workspace)/_components/WorkspaceCreateDialogProvider";
import { WorkspaceHeaderAccountsProvider } from "../(workspace)/_components/WorkspaceHeaderAccountsProvider";
import { WorkspacePlatformsModalProvider } from "../(workspace)/_components/WorkspacePlatformsModalProvider";
import { UnifiedPostsProvider } from "../(workspace)/_context/UnifiedPostsContext";
import { WorkspaceLayoutProvider } from "../(workspace)/_context/WorkspaceLayoutContext";

import { AccountLayoutShell } from "./account/_components/AccountLayoutShell";

export const metadata: Metadata = {
  title: "Account | Postsiva",
  robots: {
    index: false,
    follow: false,
  },
};

/**
 * User-global settings (profile, billing, AI usage, appearance). When a workspace
 * is active, reuse workspace chrome so the main sidebar stays visible.
 */
export default function AccountLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <AuthSessionGate>
      <MaterialSymbolsLink />
      <WorkspaceLocaleProvider>
        <WorkspaceLayoutProvider>
          <BillingProvider>
            <WorkspaceAccountSettingsProvider>
            <UpgradePlanLimitProvider>
            <WorkspaceCreateDialogProvider>
            <UnifiedPostsProvider>
              <AppClientEffects />
              <WorkspacePlatformsModalProvider>
                <WorkspaceHeaderAccountsProvider>
                  <WorkspaceComposerModalProvider>
                    <WorkspaceAgentChatShell>
                      <ActiveWorkspaceBootstrap />
                      <AccountLayoutShell>{children}</AccountLayoutShell>
                    </WorkspaceAgentChatShell>
                  </WorkspaceComposerModalProvider>
                </WorkspaceHeaderAccountsProvider>
              </WorkspacePlatformsModalProvider>
            </UnifiedPostsProvider>
            </WorkspaceCreateDialogProvider>
            </UpgradePlanLimitProvider>
            </WorkspaceAccountSettingsProvider>
          </BillingProvider>
        </WorkspaceLayoutProvider>
      </WorkspaceLocaleProvider>
    </AuthSessionGate>
  );
}
