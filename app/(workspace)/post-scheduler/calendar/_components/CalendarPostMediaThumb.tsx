"use client";

import type { MouseEvent, ReactElement } from "react";

import { WorkspaceVideoWithControls } from "@/app/(workspace)/_components/WorkspaceVideoWithControls";
import { useTranslations } from "@/lib/i18n/WorkspaceLocaleProvider";

import type { CalendarPost } from "../_types/calendarTypes";

function isLikelyVideoUrl(url: string): boolean {
  return /\.(mp4|webm|mov|m4v|mkv)(\?|$)/i.test(url.trim());
}

interface CalendarPostMediaThumbProps {
  readonly post: CalendarPost;
  readonly className?: string;
  readonly onPreview?: () => void;
}

/** Small calendar card media — prefers thumbnail image; falls back to inline video preview. */
export function CalendarPostMediaThumb({
  post,
  className = "h-11 w-11 shrink-0 overflow-hidden rounded-md bg-surface-container-low",
  onPreview,
}: CalendarPostMediaThumbProps): ReactElement | null {
  const { t } = useTranslations();

  if (!post.mediaUrl) {
    return null;
  }

  const useVideoPlayer =
    post.mediaKind === "video" && isLikelyVideoUrl(post.mediaUrl);

  const stopOpen = (event: MouseEvent): void => {
    event.stopPropagation();
  };

  const content = useVideoPlayer ? (
    <WorkspaceVideoWithControls
      src={post.mediaUrl}
      size="compact"
      className="pointer-events-none h-full w-full"
    />
  ) : (
    // eslint-disable-next-line @next/next/no-img-element -- Calendar previews render user media URLs.
    <img src={post.mediaUrl} alt="" className="h-full w-full object-cover" />
  );

  if (!onPreview) {
    return <div className={className}>{content}</div>;
  }

  return (
    <button
      type="button"
      aria-label={t("content.draftMediaPreviewTitle")}
      onClick={(event) => {
        stopOpen(event);
        onPreview();
      }}
      onMouseDown={stopOpen}
      className={`${className} cursor-zoom-in transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50`}
    >
      {content}
    </button>
  );
}
