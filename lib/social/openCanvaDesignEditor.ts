import { getStoredAccessToken, getStoredActiveWorkspaceId } from "@/lib/auth/session";
import {
  openPostsivaMediaInCanva,
} from "@/lib/social/canvaOpenFromMediaApi";
import { prepareCanvaDesignEdit } from "@/lib/social/canvaApi";
import { buildCanvaPopupName } from "@/lib/social/canvaOrigin";
import {
  CANVA_REPLACE_MEDIA_KEY_STORAGE,
  CANVA_RETURN_SESSION_STORAGE_KEY,
} from "@/lib/social/canvaReturnHandoff";

const CANVA_DEBUG_PREFIX = "[Postsiva Canva]";

function logCanvaEditorOpen(details: Record<string, unknown>): void {
  if (typeof window === "undefined") {
    return;
  }
  console.info(CANVA_DEBUG_PREFIX, details);
}

function newComposerSessionId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return String(Date.now());
}

function resolveCanvaPopupName(sessionId: string): string {
  const isPostsivaOrigin = /(^|\.)postsiva\.com$/i.test(window.location.hostname);
  return isPostsivaOrigin
    ? "postsiva-canva-edit"
    : buildCanvaPopupName(window.location.origin, sessionId);
}

function rememberSession(sessionId: string, replaceMediaKey?: string | null): void {
  try {
    window.sessionStorage.setItem(CANVA_RETURN_SESSION_STORAGE_KEY, sessionId);
    const key = replaceMediaKey?.trim();
    if (key) {
      window.sessionStorage.setItem(CANVA_REPLACE_MEDIA_KEY_STORAGE, key);
    } else {
      window.sessionStorage.removeItem(CANVA_REPLACE_MEDIA_KEY_STORAGE);
    }
  } catch {
    /* ignore */
  }
}

function openEditPopup(editUrl: string, designId: string, sessionId: string): void {
  const parsedEditUrl = new URL(editUrl);
  const popupName = resolveCanvaPopupName(sessionId);
  const availableWidth = window.screen.availWidth || window.outerWidth || 1200;
  const availableHeight = window.screen.availHeight || window.outerHeight || 800;
  const width = Math.max(720, Math.round(availableWidth * 0.8));
  const height = Math.max(560, Math.round(availableHeight * 0.8));
  const left = Math.max(0, Math.round(window.screenX + (window.outerWidth - width) / 2));
  const top = Math.max(0, Math.round(window.screenY + (window.outerHeight - height) / 2));
  const popupFeatures = `popup=yes,width=${width},height=${height},left=${left},top=${top}`;

  logCanvaEditorOpen({
    event: "open_canva_editor",
    origin: window.location.origin,
    designId,
    sessionIdLength: sessionId.length,
    popupNameLength: popupName.length,
    popupNameMode: /(^|\.)postsiva\.com$/i.test(window.location.hostname)
      ? "stable"
      : "origin-bound",
    editUrlHost: parsedEditUrl.host,
    editUrlPath: parsedEditUrl.pathname,
    hasCorrelationState: parsedEditUrl.searchParams.has("correlation_state"),
    correlationStateLength: parsedEditUrl.searchParams.get("correlation_state")?.length ?? 0,
    popupSize: `${width}x${height}`,
  });

  const popup = window.open(editUrl, popupName, popupFeatures);
  logCanvaEditorOpen({
    event: "open_canva_editor_result",
    designId,
    popupOpened: popup != null,
    popupClosedImmediately: popup?.closed ?? null,
  });
}

/** Opens an existing Canva design with return navigation. */
export async function openCanvaDesignEditor(input: {
  readonly designId: string;
  readonly editUrl?: string | null;
  readonly replaceMediaKey?: string | null;
}): Promise<void> {
  const designId = input.designId.trim();
  if (!designId) {
    return;
  }
  const token = getStoredAccessToken();
  const workspaceId = getStoredActiveWorkspaceId();
  if (!token?.trim() || !workspaceId?.trim()) {
    return;
  }

  const sessionId = newComposerSessionId();
  rememberSession(sessionId, input.replaceMediaKey);

  const editUrl = await prepareCanvaDesignEdit(token, workspaceId, {
    designId,
    editUrl: input.editUrl,
    composerSessionId: sessionId,
  });
  openEditPopup(editUrl, designId, sessionId);
}

/**
 * Opens Canva for composer/library media.
 * Reuses designId when present; otherwise uploads into Canva via open-from-media.
 */
export async function openComposerMediaInCanva(input: {
  readonly publicUrl: string;
  readonly mediaType: "image" | "video";
  readonly mediaId?: string;
  readonly filename?: string;
  readonly canvaDesignId?: string | null;
  readonly replaceMediaKey?: string | null;
}): Promise<void> {
  const designId = input.canvaDesignId?.trim();
  const replaceKey =
    input.replaceMediaKey?.trim() ||
    input.mediaId?.trim() ||
    input.publicUrl.trim() ||
    null;

  if (designId) {
    await openCanvaDesignEditor({ designId, replaceMediaKey: replaceKey });
    return;
  }

  const publicUrl = input.publicUrl.trim();
  if (!publicUrl) {
    return;
  }
  const token = getStoredAccessToken();
  const workspaceId = getStoredActiveWorkspaceId();
  if (!token?.trim() || !workspaceId?.trim()) {
    throw new Error("Sign in and select a workspace to edit in Canva");
  }

  const sessionId = newComposerSessionId();
  rememberSession(sessionId, replaceKey);

  const opened = await openPostsivaMediaInCanva(token, workspaceId, {
    mediaUrl: publicUrl,
    mediaType: input.mediaType,
    mediaId: input.mediaId,
    title: input.filename,
    composerSessionId: sessionId,
  });
  openEditPopup(opened.editUrl, opened.designId, sessionId);
}
