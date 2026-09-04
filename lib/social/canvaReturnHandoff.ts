import type { ComposerAttachedMedia } from "@/lib/post-composer/composerAttachedMediaTypes";

export const CANVA_RETURN_MESSAGE_TYPE = "postsiva-canva-return" as const;
export const CANVA_RETURN_SESSION_STORAGE_KEY = "postsiva:canva:return-session-id" as const;
export const CANVA_RETURN_PENDING_STORAGE_PREFIX = "postsiva:canva:return-pending:" as const;
export const CANVA_REPLACE_MEDIA_KEY_STORAGE = "postsiva:canva:replace-media-key" as const;

export type CanvaReturnMessage = {
  type: typeof CANVA_RETURN_MESSAGE_TYPE;
  canva: "0" | "1";
  mediaUrl?: string;
  mediaId?: string;
  uploadId?: string;
  designId?: string;
  composerSessionId?: string;
  error?: string;
  message?: string;
};

export type CanvaReturnPickParams = {
  handoff: string;
  designId: string;
};

export function canvaReturnPickParamsFromSearch(search: string): CanvaReturnPickParams | null {
  const params = new URLSearchParams(search.startsWith("?") ? search.slice(1) : search);
  if (params.get("canva") !== "pick") {
    return null;
  }
  const handoff = params.get("handoff")?.trim();
  const designId = params.get("design_id")?.trim();
  if (!handoff || !designId) {
    return null;
  }
  return { handoff, designId };
}

export function canvaReturnParamsFromSearch(search: string): CanvaReturnMessage | null {
  const params = new URLSearchParams(search.startsWith("?") ? search.slice(1) : search);
  const flag = params.get("canva");
  if (flag !== "0" && flag !== "1") {
    return null;
  }
  return {
    type: CANVA_RETURN_MESSAGE_TYPE,
    canva: flag,
    mediaUrl: params.get("media_url")?.trim() || undefined,
    mediaId: params.get("media_id")?.trim() || undefined,
    uploadId: params.get("upload_id")?.trim() || undefined,
    designId: params.get("design_id")?.trim() || undefined,
    composerSessionId: params.get("composer_session_id")?.trim() || undefined,
    error: params.get("error")?.trim() || undefined,
    message: params.get("message")?.trim() || undefined,
  };
}

export function composerMediaFromCanvaReturn(payload: CanvaReturnMessage): ComposerAttachedMedia | null {
  if (payload.canva !== "1") {
    return null;
  }
  const mediaUrl = payload.mediaUrl?.trim();
  if (!mediaUrl) {
    return null;
  }
  return {
    mediaId: payload.mediaId || payload.uploadId || "",
    publicUrl: mediaUrl,
    mediaType: "image",
    filename: `canva-${payload.designId?.trim() || "export"}.png`,
    source: "canva",
    canvaDesignId: payload.designId?.trim() || undefined,
  };
}

/** Dedupes duplicate postMessage/storage events; allows later Edit→Return cycles. */
export function canvaReturnConsumeKey(payload: CanvaReturnMessage): string {
  return [
    payload.composerSessionId?.trim() || "",
    payload.mediaId?.trim() || payload.uploadId?.trim() || "",
    payload.mediaUrl?.trim() || "",
  ].join("|");
}

export function shouldApplyCanvaReturn(
  payload: CanvaReturnMessage,
  lastConsumedKey: string | null,
): boolean {
  if (payload.canva !== "1" || !payload.mediaUrl?.trim()) {
    return false;
  }
  return canvaReturnConsumeKey(payload) !== lastConsumedKey;
}

export function isCanvaReturnMessage(data: unknown): data is CanvaReturnMessage {
  if (!data || typeof data !== "object") {
    return false;
  }
  const record = data as Record<string, unknown>;
  return record.type === CANVA_RETURN_MESSAGE_TYPE && (record.canva === "0" || record.canva === "1");
}

export function canvaReturnPendingStorageKey(composerSessionId: string): string {
  return `${CANVA_RETURN_PENDING_STORAGE_PREFIX}${composerSessionId.trim()}`;
}

export function savePendingCanvaReturn(payload: CanvaReturnMessage): void {
  const sessionId = payload.composerSessionId?.trim();
  if (!sessionId || typeof window === "undefined") {
    return;
  }
  try {
    window.localStorage.setItem(canvaReturnPendingStorageKey(sessionId), JSON.stringify(payload));
  } catch {
    /* ignore */
  }
}

export function loadPendingCanvaReturn(composerSessionId: string): CanvaReturnMessage | null {
  if (!composerSessionId.trim() || typeof window === "undefined") {
    return null;
  }
  try {
    const raw = window.localStorage.getItem(canvaReturnPendingStorageKey(composerSessionId));
    if (!raw) {
      return null;
    }
    const parsed = JSON.parse(raw) as CanvaReturnMessage;
    if (!parsed || parsed.type !== CANVA_RETURN_MESSAGE_TYPE) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

export function clearPendingCanvaReturn(composerSessionId: string): void {
  if (!composerSessionId.trim() || typeof window === "undefined") {
    return;
  }
  try {
    window.localStorage.removeItem(canvaReturnPendingStorageKey(composerSessionId));
  } catch {
    /* ignore */
  }
}
