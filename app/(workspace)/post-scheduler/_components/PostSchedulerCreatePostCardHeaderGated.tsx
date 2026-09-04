"use client";

import type { ReactElement } from "react";

import { useWorkspaceAccountSettings } from "@/app/(workspace)/_components/shell/WorkspaceAccountSettingsProvider";
import { usePlanFeature } from "@/lib/billing/BillingContext";

import { PostSchedulerCreatePostCardHeader } from "./PostSchedulerCreatePostCardHeader";

interface PostSchedulerCreatePostCardHeaderGatedProps {
  readonly aiPanelOpen: boolean;
  readonly onToggleAi: () => void;
}

export function PostSchedulerCreatePostCardHeaderGated({
  aiPanelOpen,
  onToggleAi,
}: PostSchedulerCreatePostCardHeaderGatedProps): ReactElement {
  const { openBillingSettings } = useWorkspaceAccountSettings();
  const { enabled: aiComposerEnabled } = usePlanFeature("ai_composer_enabled");

  const handleToggleAi = (): void => {
    if (!aiComposerEnabled) {
      openBillingSettings();
      return;
    }
    onToggleAi();
  };

  return (
    <PostSchedulerCreatePostCardHeader
      aiPanelOpen={aiPanelOpen}
      aiComposerEnabled={aiComposerEnabled}
      onToggleAi={handleToggleAi}
    />
  );
}
