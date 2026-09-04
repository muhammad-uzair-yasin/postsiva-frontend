"use client";

import { SocialPlatformIcon } from "@/lib/social/SocialPlatformIcon";
import {
  isSocialPlatformIconId,
  type SocialPlatformIconId,
} from "@/lib/social/socialPlatformIconSrc";
import type { UnifiedDraftResponseJson } from "@/lib/social/unifiedDraftsApi";

import { useTranslations } from "@/lib/i18n/WorkspaceLocaleProvider";
import type { DraftEditorMediaKind } from "../_hooks/useDraftEditorConfirmFlow";
import { DraftEditorImageBlock } from "./DraftEditorImageBlock";

function draftPlatformToIconId(platform: string): SocialPlatformIconId {
  const raw = platform.trim().toLowerCase();
  if (isSocialPlatformIconId(raw)) {
    return raw;
  }
  if (raw === "twitter") {
    return "x";
  }
  if (raw === "wordpress") {
    return "wordpress";
  }
  return "instagram";
}

interface DraftEditorDraftSummaryProps {
  draft: UnifiedDraftResponseJson;
  /** Resolved page/account name (never a raw numeric id when available). */
  accountLabel: string;
  onPickImage: (file: File, mediaKind: DraftEditorMediaKind) => void;
  /** When set, "Add/Change image" offers media library or device upload. */
  onPickLibraryImage?: (
    url: string,
    name: string,
    mediaId: string | null,
    mediaKind: DraftEditorMediaKind,
  ) => void;
  /** Allow replacing the video of a video post (scheduled-post editor). */
  videoChangeEnabled?: boolean;
  /** Allow image ↔ video swap on dual-media platforms. */
  allowMediaTypeSwap?: boolean;
  mediaKindOverride?: DraftEditorMediaKind;
  mediaBusy: boolean;
  mediaError: string | null;
  disabled: boolean;
  /** Compact account chip + smaller media (scheduled calendar editor). */
  compact?: boolean;
  /** Skip account chip; render media only. */
  hideAccount?: boolean;
  /** Opens account / platform picker (scheduled + draft editors). */
  onEditAccount?: () => void;
  /** Skip media block; render account chip only. */
  hideMedia?: boolean;
}

export function DraftEditorDraftSummary({
  draft,
  accountLabel,
  onPickImage,
  onPickLibraryImage,
  videoChangeEnabled = false,
  allowMediaTypeSwap = false,
  mediaKindOverride,
  mediaBusy,
  mediaError,
  disabled,
  compact = false,
  hideAccount = false,
  onEditAccount,
  hideMedia = false,
}: DraftEditorDraftSummaryProps): React.ReactElement {
  const { t } = useTranslations();

  return (
    <>
      {!hideAccount ? (
        <div
          className={
            compact
              ? "flex min-w-0 items-center gap-2 rounded-xl border border-outline-variant/10 bg-surface-container-low px-2.5 py-2"
              : "flex items-center gap-3 rounded-2xl border border-outline-variant/10 bg-surface-container-low p-4"
          }
        >
          <SocialPlatformIcon
            platform={draftPlatformToIconId(draft.platform)}
            className={
              compact
                ? "h-8 w-8 shrink-0 rounded-full"
                : "h-10 w-10 shrink-0 rounded-lg"
            }
          />
          <div className="min-w-0 flex-1">
            <p
              className={
                compact
                  ? "truncate text-sm font-semibold text-on-surface"
                  : "text-sm font-bold text-on-surface"
              }
            >
              {accountLabel}
            </p>
            {draft.platform?.toLowerCase() === "wordpress" &&
            typeof draft.wordpress?.wordpress_title === "string" &&
            draft.wordpress.wordpress_title.trim() ? (
              <p className="truncate text-xs font-semibold text-on-surface">
                {draft.wordpress.wordpress_title.trim()}
              </p>
            ) : null}
            {!compact ? (
              <p className="text-xs text-on-surface-variant">
                {draft.post_type || t("content.draftTypeFallback")} · {draft.platform}
              </p>
            ) : (
              <p className="truncate text-[11px] text-on-surface-variant">
                {draft.platform}
              </p>
            )}
          </div>
          {onEditAccount && draft.platform?.toLowerCase() !== "wordpress" ? (
            <button
              type="button"
              onClick={onEditAccount}
              disabled={disabled}
              className="shrink-0 rounded-lg p-1.5 text-on-surface-variant transition hover:bg-surface-container hover:text-on-surface disabled:cursor-not-allowed disabled:opacity-50"
              aria-label={t("content.editAccountAria")}
            >
              <span className="material-symbols-outlined text-[20px]">edit</span>
            </button>
          ) : null}
        </div>
      ) : null}

      {!hideMedia ? (
        <DraftEditorImageBlock
          draft={draft}
          onPickImage={onPickImage}
          onPickLibraryImage={onPickLibraryImage}
          videoChangeEnabled={videoChangeEnabled}
          allowMediaTypeSwap={allowMediaTypeSwap}
          mediaKindOverride={mediaKindOverride}
          mediaBusy={mediaBusy}
          mediaError={mediaError}
          disabled={disabled}
          compact={compact}
        />
      ) : null}
    </>
  );
}
