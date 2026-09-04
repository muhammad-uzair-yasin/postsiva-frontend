"use client";

import { useCallback, useState, type ReactElement } from "react";

import canvaIcon from "@/assets/social-icons/canva_icon.png";
import { useTranslations } from "@/lib/i18n/WorkspaceLocaleProvider";
import { openComposerMediaInCanva } from "@/lib/social/openCanvaDesignEditor";
import { composerAttachedMediaKey } from "@/app/(workspace)/post-scheduler/_utils/postSchedulerComposerMediaPick";
import type { ComposerAttachedMedia } from "@/lib/post-composer/composerAttachedMediaTypes";

type PreviewMediaEditInCanvaButtonProps = {
  readonly media: Pick<
    ComposerAttachedMedia,
    "publicUrl" | "mediaType" | "mediaId" | "filename" | "canvaDesignId"
  >;
  readonly className?: string;
};

/** Opens Canva with return navigation (Return to Postsiva). */
export function PreviewMediaEditInCanvaButton({
  media,
  className = "",
}: PreviewMediaEditInCanvaButtonProps): ReactElement | null {
  const { t } = useTranslations();
  const [opening, setOpening] = useState(false);
  const label = t("postScheduler.canva.editInCanva");
  const canEdit =
    (media.mediaType === "image" || media.mediaType === "video") &&
    Boolean(media.publicUrl?.trim() || media.canvaDesignId?.trim());

  const onClick = useCallback(
    async (event: React.MouseEvent<HTMLButtonElement>): Promise<void> => {
      event.stopPropagation();
      if (!canEdit || opening) {
        return;
      }
      setOpening(true);
      try {
        await openComposerMediaInCanva({
          publicUrl: media.publicUrl,
          mediaType: media.mediaType === "video" ? "video" : "image",
          mediaId: media.mediaId,
          filename: media.filename,
          canvaDesignId: media.canvaDesignId,
          replaceMediaKey: composerAttachedMediaKey(media as ComposerAttachedMedia),
        });
      } catch {
        // Quiet — hover control should not spam errors into the preview.
      } finally {
        setOpening(false);
      }
    },
    [canEdit, media, opening],
  );

  if (!canEdit) {
    return null;
  }

  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      disabled={opening}
      onClick={onClick}
      className={`flex h-7 items-center gap-1.5 rounded-full bg-black/70 px-2.5 text-white shadow-sm backdrop-blur-sm transition-colors hover:bg-black/85 disabled:opacity-60 ${className}`}
    >
      {/* eslint-disable-next-line @next/next/no-img-element -- static brand asset */}
      <img src={canvaIcon.src} alt="" className="h-4 w-4 object-contain" />
      <span className="whitespace-nowrap text-[10px] font-semibold leading-none">
        {opening ? t("postScheduler.canva.opening") : label}
      </span>
    </button>
  );
}
