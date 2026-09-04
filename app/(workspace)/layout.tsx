import type { Metadata } from "next";

import { AppClientEffects } from "@/components/AppClientEffects";
import { AuthSessionGate } from "@/lib/auth/AuthSessionGate";
import { BillingProvider } from "@/lib/billing/BillingContext";
import { UpgradePlanLimitProvider } from "@/lib/billing/UpgradePlanLimitProvider";
import { WorkspaceLocaleProvider } from "@/lib/i18n/WorkspaceLocaleProvider";

import { WorkspaceAccountSettingsProvider } from "./_components/shell/WorkspaceAccountSettingsProvider";
import { WorkspaceAgentChatShell } from "./_components/WorkspaceAgentChatShell";
import { WorkspaceComposerModalProvider } from "./_components/WorkspaceComposerModalProvider";
import { WorkspaceCreateDialogProvider } from "./_components/WorkspaceCreateDialogProvider";
import { WorkspaceHeaderAccountsProvider } from "./_components/WorkspaceHeaderAccountsProvider";
import { WorkspacePlatformsModalProvider } from "./_components/WorkspacePlatformsModalProvider";
import { WorkspaceLayoutProvider } from "./_context/WorkspaceLayoutContext";
import { ActiveWorkspaceBootstrap } from "./_components/ActiveWorkspaceBootstrap";
import { CanvaReturnProxyListener } from "./_components/CanvaReturnProxyListener";
import { WorkspaceLayoutShell } from "./_components/WorkspaceLayoutShell";
import { WorkspaceOnboardingGate } from "./_components/WorkspaceOnboardingGate";
import { WorkspaceMaterialSymbolsLink } from "./_components/WorkspaceMaterialSymbolsLink";
import { UnifiedPostsProvider } from "./_context/UnifiedPostsContext";

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
  },
};

export default function WorkspaceLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <AuthSessionGate>
      <WorkspaceMaterialSymbolsLink />
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
            <WorkspaceOnboardingGate>
              <WorkspaceComposerModalProvider>
                <WorkspaceAgentChatShell>
                  <ActiveWorkspaceBootstrap />
                  <CanvaReturnProxyListener />
                  <WorkspaceLayoutShell>{children}</WorkspaceLayoutShell>
                </WorkspaceAgentChatShell>
              </WorkspaceComposerModalProvider>
            </WorkspaceOnboardingGate>
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
