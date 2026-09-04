"use client";

import { SocialPlatformIcon } from "@/lib/social/SocialPlatformIcon";
import { useTranslations } from "@/lib/i18n/WorkspaceLocaleProvider";

import type { ComposerChannelAccount } from "../_data/postSchedulerComposerChannelAccounts";

interface PostSchedulerPerChannelDraftStripProps {
  readonly accounts: readonly ComposerChannelAccount[];
  readonly activeChannelId: string | null;
  readonly onSelectChannelId: (id: string) => void;
}

/** One tab per destination account while editing “Per post” (mirrors mobile draft channel strip). */
export function PostSchedulerPerChannelDraftStrip({
  accounts,
  activeChannelId,
  onSelectChannelId,
}: PostSchedulerPerChannelDraftStripProps): React.ReactElement {
  const { t } = useTranslations();

  if (accounts.length <= 1) {
    return <></>;
  }

  return (
    <div
      className="flex flex-wrap gap-2"
      role="tablist"
      aria-label={t("postScheduler.composer.editDraftPerChannelAria")}
    >
      {accounts.map((a) => {
        const active = a.id === activeChannelId;
        return (
          <button
            key={a.id}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => {
              onSelectChannelId(a.id);
            }}
            className={`flex max-w-full items-center gap-2 rounded-full border px-3 py-1.5 text-left text-xs font-bold transition-colors ${
              active
                ? "border-primary bg-primary-container/30 text-on-surface"
                : "border-outline-variant/20 bg-surface-container-low text-on-surface-variant hover:border-primary/40"
            }`}
          >
            <SocialPlatformIcon platform={a.platform} className="h-4 w-4 shrink-0" />
            <span className="truncate">{a.displayName}</span>
          </button>
        );
      })}
    </div>
  );
}
