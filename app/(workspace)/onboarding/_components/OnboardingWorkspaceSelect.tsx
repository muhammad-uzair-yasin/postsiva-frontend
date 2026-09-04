"use client";

import { useRouter } from "next/navigation";
import type { ReactElement } from "react";

import { useActiveWorkspaceId } from "@/app/(workspace)/_hooks/useActiveWorkspaceId";
import { useStoredWorkspaces } from "@/app/(workspace)/workspaces/_hooks/useStoredWorkspaces";
import { setActiveWorkspaceId } from "@/lib/auth/session";
import { useTranslations } from "@/lib/i18n/WorkspaceLocaleProvider";
import { formatWorkspaceDisplayName } from "@/lib/workspace/formatWorkspaceDisplayName";

export function OnboardingWorkspaceSelect(): ReactElement | null {
  const { t } = useTranslations();
  const router = useRouter();
  const { workspaces, isReady } = useStoredWorkspaces();
  const activeId = useActiveWorkspaceId();

  if (!isReady || workspaces.length <= 1) {
    return null;
  }

  const value = activeId ?? workspaces[0]?.id ?? "";

  return (
    <div className="mx-auto mb-6 flex max-w-md flex-col gap-2 sm:mb-8">
      <label
        htmlFor="onboarding-workspace-select"
        className="text-xs font-bold uppercase tracking-widest text-on-surface-variant"
      >
        {t("workspaces.onboardingConnectWorkspaceLabel")}
      </label>
      <div className="relative">
        <span
          className="material-symbols-outlined pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-lg text-on-surface-variant"
          aria-hidden
        >
          corporate_fare
        </span>
        <select
          id="onboarding-workspace-select"
          value={value}
          onChange={(event) => {
            const nextId = event.target.value;
            if (!nextId || nextId === value) {
              return;
            }
            setActiveWorkspaceId(nextId);
            router.refresh();
          }}
          className="w-full appearance-none rounded-xl border border-outline-variant/20 bg-surface-container-high py-2.5 pl-10 pr-10 text-sm font-semibold text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/30"
        >
          {workspaces.map((workspace) => (
            <option key={workspace.id} value={workspace.id}>
              {formatWorkspaceDisplayName(workspace.name)}
            </option>
          ))}
        </select>
        <span
          className="material-symbols-outlined pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-lg text-on-surface-variant"
          aria-hidden
        >
          expand_more
        </span>
      </div>
      <p className="text-xs leading-relaxed text-on-surface-variant">
        {t("workspaces.onboardingConnectWorkspaceHint")}
      </p>
    </div>
  );
}
