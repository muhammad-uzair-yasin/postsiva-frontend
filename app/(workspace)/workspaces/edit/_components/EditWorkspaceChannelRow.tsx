"use client";

import { SocialPlatformIcon } from "@/lib/social/SocialPlatformIcon";
import { useTranslations } from "@/lib/i18n/WorkspaceLocaleProvider";
import type { WorkspaceCardChannelRow } from "@/lib/workspaces/dashboardConnectedChannels";

function platformDisplayName(platform: string): string {
  return platform.replace(/_/g, " ");
}

interface EditWorkspaceChannelRowProps {
  channel: WorkspaceCardChannelRow;
  disconnectBusy: boolean;
  onDisconnectClick: () => void;
}

export function EditWorkspaceChannelRow({
  channel,
  disconnectBusy,
  onDisconnectClick,
}: EditWorkspaceChannelRowProps): React.ReactElement {
  const { t } = useTranslations();

  return (
    <div className="group flex items-center justify-between rounded-xl bg-surface-container-low p-4 transition-colors hover:bg-surface-container">
      <div className="flex items-center gap-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-surface-container-high p-1.5 shadow-lg ring-1 ring-outline-variant/10">
          <SocialPlatformIcon platform={channel.platform} className="h-7 w-7" />
        </div>
        <div className="flex flex-col">
          <span className="text-sm font-semibold capitalize text-on-surface">
            {platformDisplayName(channel.platform)}
          </span>
          <span className="text-xs text-on-surface-variant">{channel.label}</span>
        </div>
      </div>
      <button
        type="button"
        disabled={disconnectBusy}
        onClick={onDisconnectClick}
        className="rounded-lg border border-error/20 px-3 py-1.5 text-xs font-bold text-error opacity-0 transition-colors hover:bg-error/10 group-hover:opacity-100 disabled:cursor-not-allowed disabled:opacity-40"
      >
        {t("workspaces.editChannelDisconnect")}
      </button>
    </div>
  );
}
