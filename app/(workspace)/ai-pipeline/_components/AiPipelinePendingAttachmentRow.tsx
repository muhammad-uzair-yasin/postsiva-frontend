"use client";

import type { ComposerAttachedMedia } from "@/lib/post-composer/composerAttachedMediaTypes";
import { useTranslations } from "@/lib/i18n/WorkspaceLocaleProvider";

export interface AiPipelinePendingAttachmentRowProps {
  readonly attachment: ComposerAttachedMedia;
  readonly onRemove: () => void;
}

export function AiPipelinePendingAttachmentRow({
  attachment,
  onRemove,
}: AiPipelinePendingAttachmentRowProps): React.ReactElement {
  const { t } = useTranslations();

  return (
    <div className="flex items-center gap-3 rounded-xl border border-secondary/30 bg-surface-container-high px-3 py-2">
      <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg border border-outline-variant/20 bg-black/20">
        {attachment.mediaType === "image" ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={attachment.publicUrl}
            alt=""
            className="h-full w-full object-cover"
          />
        ) : (
          <video
            src={attachment.publicUrl}
            className="h-full w-full object-cover"
            muted
            playsInline
            preload="metadata"
          />
        )}
      </div>
      <div className="min-w-0 flex-1 text-left">
        <p className="text-xs font-bold text-on-surface">
          {attachment.mediaType === "video"
            ? t("aiPipeline.attachmentVideoReady")
            : t("aiPipeline.attachmentImageReady")}
        </p>
        <p className="truncate text-[10px] text-on-surface-variant">
          {attachment.filename || t("aiPipeline.attachmentFallback")}
        </p>
      </div>
      <button
        type="button"
        onClick={onRemove}
        className="shrink-0 rounded-lg p-2 text-on-surface-variant hover:bg-surface-container-highest"
        aria-label={t("aiPipeline.removeAttachmentAria")}
      >
        <span className="material-symbols-outlined text-lg">close</span>
      </button>
    </div>
  );
}
