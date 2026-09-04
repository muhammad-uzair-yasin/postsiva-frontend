"use client";

import type { AuthWorkspaceLoginItem } from "@/lib/auth/types";
import { useTranslations } from "@/lib/i18n/WorkspaceLocaleProvider";
import { workspaceStitchChannelsFromWorkspace } from "@/lib/workspaces/dashboardConnectedChannels";

import { STITCH_WORKSPACE_CARDS } from "../_data/workspaceSelectionSeed";
import type { WorkspaceStitchCardSeed } from "../_types/workspaceSelectionSeed";
import { useStoredWorkspaces } from "../_hooks/useStoredWorkspaces";

import { WorkspaceCreateCard } from "./WorkspaceCreateCard";
import { WorkspaceStitchCard } from "./WorkspaceStitchCard";

function initialLetterFromWorkspaceName(
  name: string,
  fallback: string,
): string {
  const t = name.trim();
  if (!t) {
    return fallback;
  }
  return t.charAt(0).toUpperCase();
}

function seedsFromStoredWorkspaces(
  workspaces: AuthWorkspaceLoginItem[],
): WorkspaceStitchCardSeed[] {
  return workspaces.map((ws, index) => {
    const template =
      STITCH_WORKSPACE_CARDS[index % STITCH_WORKSPACE_CARDS.length];
    const allChannels = workspaceStitchChannelsFromWorkspace(ws);
    return {
      ...template,
      id: ws.id,
      title: ws.name,
      memberCount: ws.member_count,
      memberAvatarSrcs: [],
      memberOverflowLabel: undefined,
      initialLetter: initialLetterFromWorkspaceName(
        ws.name,
        template.initialLetter,
      ),
      imageUrl: ws.image_url ?? null,
      channels: allChannels,
      totalChannelCount: allChannels.length,
    };
  });
}

export function WorkspaceStitchGrid(): React.ReactElement {
  const { t } = useTranslations();
  const { workspaces, isReady, isLoadingWorkspaces } = useStoredWorkspaces();

  const hasWorkspaces = isReady && workspaces.length > 0;
  const items = hasWorkspaces ? seedsFromStoredWorkspaces(workspaces) : [];

  if (isLoadingWorkspaces) {
    return (
      <div
        className="flex min-h-[320px] flex-col items-center justify-center gap-4"
        role="status"
        aria-live="polite"
        aria-busy="true"
        aria-label={t("workspaces.loadingAria")}
      >
        <div
          className="h-10 w-10 animate-spin rounded-full border-2 border-primary/30 border-t-primary"
          aria-hidden
        />
        <p className="text-sm text-on-surface-variant">{t("workspaces.loading")}</p>
      </div>
    );
  }

  return (
    <div className="grid w-full grid-cols-1 gap-5 sm:grid-cols-2 sm:gap-6 xl:grid-cols-3">
      {items.map((seed) => (
        <WorkspaceStitchCard key={seed.id} seed={seed} />
      ))}
      <WorkspaceCreateCard />
    </div>
  );
}
