"use client";

import { useCallback, useState, type ReactElement } from "react";

import canvaIcon from "@/assets/social-icons/canva_icon.png";
import { useTranslations } from "@/lib/i18n/WorkspaceLocaleProvider";
import { openComposerMediaInCanva } from "@/lib/social/openCanvaDesignEditor";
import type { UnifiedMediaListItem } from "@/lib/social/unifiedMediaApi";

/** Compact hover control for media library tiles. */
export function MediaLibraryEditInCanvaButton({
  item,
}: {
  readonly item: UnifiedMediaListItem;
}): ReactElement | null {
  const { t } = useTranslations();
  const [opening, setOpening] = useState(false);
  const mediaType = item.media_type === "video" ? "video" : item.media_type === "image" ? "image" : null;
  const url = item.public_url?.trim() || "";

  const onClick = useCallback(
    async (event: React.MouseEvent<HTMLButtonElement>): Promise<void> => {
      event.stopPropagation();
      if (!mediaType || !url || opening) {
        return;
      }
      setOpening(true);
      try {
        await openComposerMediaInCanva({
          publicUrl: url,
          mediaType,
          mediaId: item.media_id,
          filename: item.filename || undefined,
          replaceMediaKey: item.media_id || url,
        });
      } catch {
        /* quiet */
      } finally {
        setOpening(false);
      }
    },
    [item.filename, item.media_id, mediaType, opening, url],
  );

  if (!mediaType || !url) {
    return null;
  }

  return (
    <button
      type="button"
      aria-label={t("postScheduler.canva.editInCanva")}
      title={t("postScheduler.canva.editInCanva")}
      disabled={opening}
      onClick={onClick}
      className="absolute left-2 top-2 z-[22] flex h-7 w-7 items-center justify-center rounded-full bg-black/65 text-white opacity-0 shadow-md backdrop-blur-sm transition-opacity hover:bg-black/80 group-hover:opacity-100 group-focus-within:opacity-100 disabled:opacity-50"
    >
      {/* eslint-disable-next-line @next/next/no-img-element -- static brand asset */}
      <img src={canvaIcon.src} alt="" className="h-4 w-4 object-contain" />
    </button>
  );
}
