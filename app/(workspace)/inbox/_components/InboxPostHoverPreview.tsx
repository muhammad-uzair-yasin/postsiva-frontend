"use client";

import { useMemo, type ReactElement } from "react";

import type { ContentManagerPost } from "@/app/(workspace)/content-manager/_types/contentManagerTypes";

import { POST_HOVER_PREVIEW_AUTO_CLOSE_MS } from "@/app/(workspace)/_constants/postHoverPreviewTiming";

import { CalendarPostHoverPreview } from "../../post-scheduler/calendar/_components/CalendarPostHoverPreview";
import { mapContentManagerPostToCalendarPost } from "../../post-scheduler/calendar/_utils/mapContentManagerPostToCalendarPost";

interface InboxPostHoverPreviewProps {
  readonly post: ContentManagerPost;
  readonly open: boolean;
  readonly autoCloseResetKey: number;
  readonly onClose: () => void;
  readonly onPanelMouseEnter: () => void;
  readonly onPanelMouseLeave: () => void;
}

/** Slide-in preview (calendar UI) with close control and pointer access for inbox. */
export function InboxPostHoverPreview({
  post,
  open,
  autoCloseResetKey,
  onClose,
  onPanelMouseEnter,
  onPanelMouseLeave,
}: InboxPostHoverPreviewProps): ReactElement | null {
  const calendarPost = useMemo(
    () => mapContentManagerPostToCalendarPost(post),
    [post],
  );
  if (!calendarPost) {
    return null;
  }
  return (
    <CalendarPostHoverPreview
      post={calendarPost}
      open={open}
      interactive
      onClose={onClose}
      onPanelMouseEnter={onPanelMouseEnter}
      onPanelMouseLeave={onPanelMouseLeave}
      autoCloseDurationMs={POST_HOVER_PREVIEW_AUTO_CLOSE_MS}
      autoCloseResetKey={autoCloseResetKey}
    />
  );
}
