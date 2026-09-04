"use client";

import { useEffect, useRef } from "react";

import type { ComposerAttachedMedia } from "@/lib/post-composer/composerAttachedMediaTypes";
import {
  CANVA_REPLACE_MEDIA_KEY_STORAGE,
  CANVA_RETURN_SESSION_STORAGE_KEY,
  canvaReturnConsumeKey,
  canvaReturnParamsFromSearch,
  composerMediaFromCanvaReturn,
  clearPendingCanvaReturn,
  loadPendingCanvaReturn,
  isCanvaReturnMessage,
  shouldApplyCanvaReturn,
  type CanvaReturnMessage,
} from "@/lib/social/canvaReturnHandoff";
import { canvaOriginsMatch } from "@/lib/social/canvaOrigin";
import { invalidateUnifiedMediaListCache } from "@/lib/social/unifiedMediaApi";

export type CanvaReturnMediaHandler = (
  media: ComposerAttachedMedia,
  opts?: { readonly replaceMediaKey?: string },
) => void;

function takeReplaceMediaKey(): string | undefined {
  try {
    const key = window.sessionStorage.getItem(CANVA_REPLACE_MEDIA_KEY_STORAGE)?.trim();
    window.sessionStorage.removeItem(CANVA_REPLACE_MEDIA_KEY_STORAGE);
    return key || undefined;
  } catch {
    return undefined;
  }
}

/** Applies Canva return (popup postMessage or same-tab query params) into composer media. */
export function useCanvaReturnHandoff(
  onMedia: CanvaReturnMediaHandler,
  onSettled?: () => void,
): void {
  const lastConsumedKeyRef = useRef<string | null>(null);
  const onMediaRef = useRef(onMedia);
  const onSettledRef = useRef(onSettled);

  useEffect(() => {
    onMediaRef.current = onMedia;
    onSettledRef.current = onSettled;
  }, [onMedia, onSettled]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const applyPayload = (payload: CanvaReturnMessage): boolean => {
      if (!shouldApplyCanvaReturn(payload, lastConsumedKeyRef.current)) {
        return false;
      }
      const media = composerMediaFromCanvaReturn(payload);
      if (!media) {
        return false;
      }
      lastConsumedKeyRef.current = canvaReturnConsumeKey(payload);
      const replaceMediaKey = takeReplaceMediaKey();
      invalidateUnifiedMediaListCache();
      onMediaRef.current(media, replaceMediaKey ? { replaceMediaKey } : undefined);
      onSettledRef.current?.();
      if (payload.composerSessionId?.trim()) {
        clearPendingCanvaReturn(payload.composerSessionId);
      }
      return true;
    };

    const onMessage = (event: MessageEvent): void => {
      if (!canvaOriginsMatch(event.origin, window.location.origin)) {
        return;
      }
      if (!isCanvaReturnMessage(event.data)) {
        return;
      }
      applyPayload(event.data);
    };

    window.addEventListener("message", onMessage);

    const onStorage = (event: StorageEvent): void => {
      if (event.storageArea !== window.localStorage) {
        return;
      }
      if (!event.key?.startsWith("postsiva:canva:return-pending:")) {
        return;
      }
      const sessionId = window.sessionStorage.getItem(CANVA_RETURN_SESSION_STORAGE_KEY)?.trim();
      if (!sessionId || !event.key.endsWith(sessionId)) {
        return;
      }
      const pending = loadPendingCanvaReturn(sessionId);
      if (pending) {
        applyPayload(pending);
      }
    };

    window.addEventListener("storage", onStorage);

    const sessionId = window.sessionStorage.getItem(CANVA_RETURN_SESSION_STORAGE_KEY)?.trim();
    if (sessionId) {
      const pending = loadPendingCanvaReturn(sessionId);
      if (pending) {
        applyPayload(pending);
      }
    }

    const fromSearch = canvaReturnParamsFromSearch(window.location.search);
    if (fromSearch && applyPayload(fromSearch)) {
      const params = new URLSearchParams(window.location.search);
      params.delete("media_id");
      params.delete("canva");
      params.delete("media_url");
      params.delete("upload_id");
      params.delete("design_id");
      params.delete("composer_session_id");
      params.delete("post_id");
      params.delete("error");
      params.delete("message");
      const qs = params.toString();
      const next = `${window.location.pathname}${qs ? `?${qs}` : ""}${window.location.hash}`;
      window.history.replaceState(null, "", next);
    }

    return () => {
      window.removeEventListener("message", onMessage);
      window.removeEventListener("storage", onStorage);
    };
  }, []);
}
