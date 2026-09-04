"use client";

import type { ReactElement } from "react";

import { useTranslations } from "@/lib/i18n/WorkspaceLocaleProvider";
import type { ComposerAttachedMedia } from "@/lib/post-composer/composerAttachedMediaTypes";

import { PreviewMediaEditInCanvaButton } from "./PreviewMediaEditInCanvaButton";

type PreviewMediaTopRightActionsProps = {
  readonly filename: string;
  readonly media?: Pick<
    ComposerAttachedMedia,
    "publicUrl" | "mediaType" | "mediaId" | "filename" | "canvaDesignId"
  > | null;
  readonly onRemove?: () => void;
  readonly showOnHoverOnly?: boolean;
};

/** Live-preview media chrome: Edit in Canva + remove, top-right. */
export function PreviewMediaTopRightActions({
  filename,
  media,
  onRemove,
  showOnHoverOnly = false,
}: PreviewMediaTopRightActionsProps): ReactElement | null {
  const { t } = useTranslations();
  const showCanva =
    media &&
    (media.mediaType === "image" || media.mediaType === "video") &&
    Boolean(media.publicUrl?.trim() || media.canvaDesignId?.trim());
  if (!showCanva && !onRemove) {
    return null;
  }
  const visibility = showOnHoverOnly
    ? "opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100"
    : "";

  return (
    <div className={`absolute right-2 top-2 z-30 flex items-center gap-1.5 ${visibility}`}>
      {showCanva && media ? <PreviewMediaEditInCanvaButton media={media} /> : null}
      {onRemove ? (
        <button
          type="button"
          aria-label={t("postScheduler.composer.removeAttachedMedia", { name: filename })}
          onClick={(event) => {
            event.stopPropagation();
            onRemove();
          }}
          className="flex h-7 w-7 items-center justify-center rounded-full bg-black/60 text-white shadow-sm backdrop-blur-sm transition-colors hover:bg-error"
        >
          <span className="material-symbols-outlined text-[16px] leading-none">close</span>
        </button>
      ) : null}
    </div>
  );
}
