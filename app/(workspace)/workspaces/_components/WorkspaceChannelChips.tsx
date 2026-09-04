"use client";

import { useTranslations } from "@/lib/i18n/WorkspaceLocaleProvider";
import { SocialPlatformIcon } from "@/lib/social/SocialPlatformIcon";

import type { WorkspaceStitchChannelRow } from "../_types/workspaceSelectionSeed";

const MAX_VISIBLE = 7;

type WorkspaceChannelChipsProps = {
  channels: WorkspaceStitchChannelRow[];
  totalCount: number;
};

export function WorkspaceChannelChips({
  channels,
  totalCount,
}: WorkspaceChannelChipsProps): React.ReactElement {
  const { t } = useTranslations();

  if (totalCount === 0) {
    return (
      <div className="flex min-h-[52px] items-center rounded-xl border border-dashed border-outline-variant/20 bg-surface-container-low/50 px-4">
        <span className="text-xs text-on-surface-variant">
          {t("workspaces.channelsEmpty")}
        </span>
      </div>
    );
  }

  const visible = channels.slice(0, MAX_VISIBLE);
  const overflow = Math.max(0, totalCount - visible.length);

  return (
    <div className="flex flex-wrap items-center gap-2">
      {visible.map((ch, index) => (
        <div
          key={`${ch.platform}-${index}`}
          title={ch.label}
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-outline-variant/10 bg-surface-container-low shadow-sm transition-colors group-hover:border-outline-variant/25"
        >
          <SocialPlatformIcon platform={ch.platform} className="h-5 w-5" />
        </div>
      ))}
      {overflow > 0 ? (
        <div
          className="flex h-9 min-w-9 items-center justify-center rounded-lg border border-outline-variant/15 bg-surface-container-high px-2 text-xs font-bold text-on-surface-variant"
          title={t("workspaces.channelsMoreConnected", { count: overflow })}
        >
          +{overflow}
        </div>
      ) : null}
      <span className="ml-1 text-xs text-on-surface-variant">
        {t("workspaces.channelsConnectedCount", { count: totalCount })}
      </span>
    </div>
  );
}
