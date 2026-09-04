"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, type ReactElement } from "react";

import { AdPlatformsModal } from "@/app/(workspace)/ad-platform/_components/AdPlatformsModal";
import { useTranslations } from "@/lib/i18n/WorkspaceLocaleProvider";
import {
  getStoredActiveWorkspaceId,
  getStoredWorkspaces,
} from "@/lib/auth/session";
import { markConnectOnboardingComplete } from "@/lib/auth/workspaceOnboarding";
import { useWorkspaceHeaderAccounts } from "@/app/(workspace)/_components/WorkspaceHeaderAccountsProvider";

import { OnboardingGateLoadingScreen } from "../../_components/OnboardingGateLoadingScreen";
import { OnboardingShell } from "../../_components/OnboardingShell";
import { OnboardingWorkspaceSelect } from "../../_components/OnboardingWorkspaceSelect";
import { useOnboardingConnectionGate } from "../../_context/OnboardingConnectionGateContext";

export function OnboardingConnectScreen(): ReactElement {
  const { t } = useTranslations();
  const router = useRouter();
  const { isChecking } = useOnboardingConnectionGate();
  const { hasAnySocialConnection, isConnectGateLoading } =
    useWorkspaceHeaderAccounts();

  useEffect(() => {
    if (getStoredWorkspaces().length === 0) {
      router.replace("/onboarding/workspace");
      return;
    }
    if (!getStoredActiveWorkspaceId()) {
      router.replace("/onboarding/workspace");
    }
  }, [router]);

  useEffect(() => {
    if (hasAnySocialConnection) {
      markConnectOnboardingComplete();
      router.replace("/dashboard");
    }
  }, [hasAnySocialConnection, router]);

  const goToDashboard = useCallback((): void => {
    markConnectOnboardingComplete();
    router.replace("/dashboard");
  }, [router]);

  if (isChecking || isConnectGateLoading) {
    return (
      <OnboardingShell step={2} wide>
        <OnboardingGateLoadingScreen fullPage={false} />
      </OnboardingShell>
    );
  }

  return (
    <OnboardingShell step={2} wide>
      <OnboardingWorkspaceSelect />

      <div className="mb-6 text-center sm:mb-8">
        <p className="text-xs font-bold uppercase tracking-widest text-secondary">
          {t("workspaces.onboardingEyebrow")}
        </p>
        <h1 className="mt-2 font-headline text-2xl font-bold tracking-tight text-on-surface sm:text-3xl">
          {t("workspaces.onboardingConnectTitle")}
        </h1>
        <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-on-surface-variant sm:text-base">
          {t("workspaces.onboardingConnectSubtitle")}
        </p>
      </div>

      <div className="rounded-3xl border border-outline-variant/15 bg-surface-container-low p-4 shadow-xl sm:p-6">
        <AdPlatformsModal variant="embedded" onClose={goToDashboard} />
      </div>

      <div className="mt-6 flex justify-center">
        <button
          type="button"
          onClick={goToDashboard}
          className="rounded-xl px-4 py-2.5 text-sm font-semibold text-on-surface-variant underline-offset-4 hover:bg-surface-container-high hover:text-on-surface hover:underline"
        >
          {t("workspaces.onboardingConnectSkip")}
        </button>
      </div>
    </OnboardingShell>
  );
}
