"use client";

import { useMemo, useState } from "react";

import { useTranslations } from "@/lib/i18n/WorkspaceLocaleProvider";

import { getDraftEditorConfirmCopy } from "../_utils/draftEditorConfirmCopy";

export type DraftEditorMediaKind =
  | "image"
  | "video"
  | "imageOrVideo"
  | "thumbnail"
  | "youtubeThumbnail";

/** Resolve picker kind from a device file when the editor accepts both. */
export function mediaKindFromFile(
  file: File,
  fallback: DraftEditorMediaKind = "image",
): DraftEditorMediaKind {
  const mime = (file.type || "").toLowerCase();
  if (mime.startsWith("video/")) {
    return "video";
  }
  if (mime.startsWith("image/")) {
    return "image";
  }
  const name = file.name.toLowerCase();
  if (/\.(mp4|mov|webm|m4v|avi|mkv)$/i.test(name)) {
    return "video";
  }
  if (/\.(jpe?g|png|gif|webp|bmp|heic|heif)$/i.test(name)) {
    return "image";
  }
  return fallback === "imageOrVideo" ? "image" : fallback;
}

/** Resolve picker kind from library media type when the editor accepts both. */
export function mediaKindFromLibraryType(
  mediaType: string | null | undefined,
  fallback: DraftEditorMediaKind = "image",
): DraftEditorMediaKind {
  const t = (mediaType || "").trim().toLowerCase();
  if (t === "video") {
    return "video";
  }
  if (t === "image") {
    return "image";
  }
  return fallback === "imageOrVideo" ? "image" : fallback;
}

export type DraftEditorConfirmState =
  | null
  | { kind: "update" }
  | { kind: "updateScheduled" }
  | { kind: "publish"; channelLabel: string }
  | { kind: "delete" }
  | { kind: "deleteScheduled" }
  | { kind: "schedule"; isoUtc: string }
  | { kind: "reschedule"; isoUtc: string }
  | { kind: "replaceImage"; file: File; mediaKind: DraftEditorMediaKind }
  | {
      kind: "replaceImageUrl";
      url: string;
      name: string;
      mediaId: string | null;
      mediaKind: DraftEditorMediaKind;
    }
  | { kind: "moveToDraft" };

function extrasFor(
  confirm: Exclude<DraftEditorConfirmState, null>,
  locale: string,
): {
  scheduleLabel?: string;
  fileName?: string;
  publishChannelLabel?: string;
  isVideo?: boolean;
} {
  if (confirm.kind === "schedule" || confirm.kind === "reschedule") {
    const date = new Date(confirm.isoUtc);
    return {
      scheduleLabel: `${date.toLocaleDateString(locale, {
        month: "short",
        day: "numeric",
        year: "numeric",
      })}, ${date.toLocaleTimeString(locale, {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      })}`,
    };
  }
  // Prefer generic copy + visual preview in the modal (library often stores
  // opaque names like downloaded_media.jpg).
  if (confirm.kind === "replaceImage") {
    return { isVideo: confirm.mediaKind === "video" };
  }
  if (confirm.kind === "replaceImageUrl") {
    return { isVideo: confirm.mediaKind === "video" };
  }
  if (confirm.kind === "publish") {
    return { publishChannelLabel: confirm.channelLabel };
  }
  return {};
}

export function useDraftEditorConfirmFlow(): {
  confirm: DraftEditorConfirmState;
  modalCopy: ReturnType<typeof getDraftEditorConfirmCopy> | null;
  close: () => void;
  requestUpdate: () => void;
  requestUpdateScheduled: () => void;
  requestPublish: (channelLabel: string) => void;
  requestDelete: () => void;
  requestDeleteScheduled: () => void;
  requestSchedule: (isoUtc: string) => void;
  requestReschedule: (isoUtc: string) => void;
  requestReplaceImage: (file: File, mediaKind?: DraftEditorMediaKind) => void;
  requestReplaceImageUrl: (
    url: string,
    name: string,
    mediaId?: string | null,
    mediaKind?: DraftEditorMediaKind,
  ) => void;
  requestMoveToDraft: () => void;
} {
  const { t, locale } = useTranslations();
  const [confirm, setConfirm] = useState<DraftEditorConfirmState>(null);

  const modalCopy = useMemo(() => {
    if (!confirm) {
      return null;
    }
    return getDraftEditorConfirmCopy(t, confirm.kind, extrasFor(confirm, locale));
  }, [confirm, locale, t]);

  const close = (): void => {
    setConfirm(null);
  };

  return {
    confirm,
    modalCopy,
    close,
    requestUpdate: () => {
      setConfirm({ kind: "update" });
    },
    requestUpdateScheduled: () => {
      setConfirm({ kind: "updateScheduled" });
    },
    requestPublish: (channelLabel: string) => {
      setConfirm({ kind: "publish", channelLabel });
    },
    requestDelete: () => {
      setConfirm({ kind: "delete" });
    },
    requestDeleteScheduled: () => {
      setConfirm({ kind: "deleteScheduled" });
    },
    requestSchedule: (isoUtc: string) => {
      setConfirm({ kind: "schedule", isoUtc });
    },
    requestReschedule: (isoUtc: string) => {
      setConfirm({ kind: "reschedule", isoUtc });
    },
    requestReplaceImage: (file: File, mediaKind: DraftEditorMediaKind = "image") => {
      setConfirm({ kind: "replaceImage", file, mediaKind });
    },
    requestReplaceImageUrl: (
      url: string,
      name: string,
      mediaId: string | null = null,
      mediaKind: DraftEditorMediaKind = "image",
    ) => {
      setConfirm({ kind: "replaceImageUrl", url, name, mediaId, mediaKind });
    },
    requestMoveToDraft: () => {
      setConfirm({ kind: "moveToDraft" });
    },
  };
}
