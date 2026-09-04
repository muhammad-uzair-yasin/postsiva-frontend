"use client";

import { useEffect, type ReactElement } from "react";
import { useRouter } from "next/navigation";

import { useTranslations } from "@/lib/i18n/WorkspaceLocaleProvider";
import { getStoredWorkspaces } from "@/lib/auth/session";

import { OnboardingShell } from "../../_components/OnboardingShell";
import { useOnboardingWorkspaceSetup } from "../../_hooks/useOnboardingWorkspaceSetup";

export function OnboardingWorkspaceScreen(): ReactElement {
  const { t } = useTranslations();
  const router = useRouter();
  const setup = useOnboardingWorkspaceSetup();

  useEffect(() => {
    if (getStoredWorkspaces().length > 0) {
      router.replace("/onboarding/connect");
    }
  }, [router]);

  return (
    <OnboardingShell step={1}>
      <div className="rounded-3xl border border-outline-variant/15 bg-surface-container-low p-6 shadow-xl sm:p-8">
        <p className="text-xs font-bold uppercase tracking-widest text-secondary">
          {t("workspaces.onboardingEyebrow")}
        </p>
        <h1 className="mt-2 font-headline text-2xl font-bold tracking-tight text-on-surface sm:text-3xl">
          {t("workspaces.onboardingWorkspaceTitle")}
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-on-surface-variant sm:text-base">
          {t("workspaces.onboardingWorkspaceSubtitle")}
        </p>

        <form
          className="mt-8 space-y-4"
          onSubmit={(event) => {
            event.preventDefault();
            void setup.submitNamed();
          }}
        >
          {setup.error ? (
            <p
              className="rounded-xl border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-200"
              role="alert"
            >
              {setup.error}
            </p>
          ) : null}

          <div>
            <label
              htmlFor="onboarding-workspace-name"
              className="mb-1.5 block text-xs font-semibold text-on-surface-variant"
            >
              {t("workspaces.createNameLabel")}
            </label>
            <input
              id="onboarding-workspace-name"
              type="text"
              autoComplete="organization"
              value={setup.name}
              onChange={(event) => setup.setName(event.target.value)}
              className="w-full rounded-xl border-0 bg-surface-container-high px-4 py-3 text-on-surface placeholder:text-outline focus:ring-2 focus:ring-secondary/50"
              placeholder={t("workspaces.createNamePlaceholder")}
              disabled={setup.isSubmitting}
            />
          </div>

          <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={() => void setup.submitSkip()}
              disabled={setup.isSubmitting}
              className="rounded-xl px-4 py-2.5 text-sm font-semibold text-on-surface-variant hover:bg-surface-container-high disabled:opacity-50"
            >
              {t("workspaces.onboardingWorkspaceSkip")}
            </button>
            <button
              type="submit"
              disabled={setup.isSubmitting}
              className="rounded-xl bg-primary px-5 py-2.5 text-sm font-bold text-on-primary shadow-md hover:brightness-110 disabled:opacity-50"
            >
              {setup.isSubmitting
                ? t("workspaces.createSubmitting")
                : t("workspaces.onboardingWorkspaceContinue")}
            </button>
          </div>
        </form>
      </div>
    </OnboardingShell>
  );
}
