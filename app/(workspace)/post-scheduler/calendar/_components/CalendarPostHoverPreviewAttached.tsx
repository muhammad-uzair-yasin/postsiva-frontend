"use client";

import type { ReactElement } from "react";

import { POST_HOVER_PREVIEW_AUTO_CLOSE_MS } from "@/app/(workspace)/_constants/postHoverPreviewTiming";

import type { CalendarPost } from "../_types/calendarTypes";
import { CalendarPostHoverPreview } from "./CalendarPostHoverPreview";

interface CalendarPostHoverPreviewAttachedProps {
  readonly post: CalendarPost;
  readonly open: boolean;
  readonly autoCloseResetKey: number;
  readonly onClose: () => void;
  readonly onPanelMouseEnter: () => void;
  readonly onPanelMouseLeave: () => void;
  readonly placement?: "fixed" | "inline";
}

/** Calendar/inbox shared hover preview with countdown + manual close. */
export function CalendarPostHoverPreviewAttached({
  post,
  open,
  autoCloseResetKey,
  onClose,
  onPanelMouseEnter,
  onPanelMouseLeave,
  placement = "fixed",
}: CalendarPostHoverPreviewAttachedProps): ReactElement {
  return (
    <CalendarPostHoverPreview
      post={post}
      open={open}
      interactive={placement === "fixed"}
      onClose={onClose}
      onPanelMouseEnter={onPanelMouseEnter}
      onPanelMouseLeave={onPanelMouseLeave}
      autoCloseDurationMs={placement === "fixed" ? POST_HOVER_PREVIEW_AUTO_CLOSE_MS : undefined}
      autoCloseResetKey={placement === "fixed" ? autoCloseResetKey : undefined}
      placement={placement}
    />
  );
}
