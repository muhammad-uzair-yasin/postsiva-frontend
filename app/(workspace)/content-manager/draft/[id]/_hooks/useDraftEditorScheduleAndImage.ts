"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

import {
  getStoredAccessToken,
  getStoredActiveWorkspaceId,
} from "@/lib/auth/session";
import { dispatchContentManagerDraftRefresh } from "@/lib/contentManager/contentManagerDraftRefresh";
import {
  patchUnifiedDraftById,
  scheduleUnifiedDraftById,
  type UnifiedDraftResponseJson,
} from "@/lib/social/unifiedDraftsApi";
import { uploadUnifiedWorkspaceMediaFromFile } from "@/lib/social/unifiedMediaUploadWeb";
import { uploadWorkspaceImage } from "@/lib/workspaces/workspaceApi";

import type { DraftEditorMediaKind } from "./useDraftEditorConfirmFlow";

export interface UseDraftEditorScheduleAndImageOptions {
  /**
   * Called after schedule API succeeds. When set, default navigation to the
   * Scheduled tab is skipped (caller handles close + toast + router).
   */
  onScheduleSuccess?: () => void;
}

export function useDraftEditorScheduleAndImage(
  draftId: string,
  setDraft: (d: UnifiedDraftResponseJson) => void,
  options?: UseDraftEditorScheduleAndImageOptions,
): {
  mediaBusy: boolean;
  mediaError: string | null;
  scheduleBusy: boolean;
  scheduleError: string | null;
  scheduleDraft: (scheduledTimeIso: string) => Promise<void>;
  changeMediaFromFile: (file: File, kind: DraftEditorMediaKind) => Promise<void>;
  changeMediaFromUrl: (
    url: string,
    mediaId: string | null,
    kind: DraftEditorMediaKind,
  ) => Promise<void>;
} {
  const router = useRouter();
  const optionsRef = useRef(options);
  useEffect(() => {
    optionsRef.current = options;
  }, [options]);
  const [mediaBusy, setMediaBusy] = useState(false);
  const [mediaError, setMediaError] = useState<string | null>(null);
  const [scheduleBusy, setScheduleBusy] = useState(false);
  const [scheduleError, setScheduleError] = useState<string | null>(null);

  const applyMediaPatch = useCallback(
    async (
      token: string,
      ws: string,
      url: string,
      mediaId: string | null,
      kind: DraftEditorMediaKind,
    ): Promise<void> => {
      // Draft PATCH deletes keys sent as null — stale ids must go away or the
      // publisher would prefer the old id over the new URL.
      const patch =
        kind === "video"
          ? { video_url: url, video_id: mediaId }
          : kind === "youtubeThumbnail" || kind === "thumbnail"
            ? {
                thumbnail_url: url,
                thumbnail_image_id: mediaId,
                generate_thumbnail_from_content: false,
              }
            : { default_image_url: url, default_image_id: mediaId };
      const patchRes = await patchUnifiedDraftById(token, ws, draftId, patch);
      if (patchRes.success && patchRes.data) {
        setDraft(patchRes.data);
      } else {
        setMediaError("Media update failed.");
      }
    },
    [draftId, setDraft],
  );

  const changeMediaFromFile = useCallback(
    async (file: File, kind: DraftEditorMediaKind): Promise<void> => {
      const token = getStoredAccessToken();
      const ws = getStoredActiveWorkspaceId();
      if (!token?.trim() || !ws?.trim()) {
        setMediaError("Not signed in.");
        return;
      }
      setMediaBusy(true);
      setMediaError(null);
      try {
        if (kind === "video") {
          const { mediaId, publicUrl } = await uploadUnifiedWorkspaceMediaFromFile(
            token,
            ws,
            file,
          );
          if (!publicUrl.trim()) {
            setMediaError("Media update failed.");
            return;
          }
          await applyMediaPatch(token, ws, publicUrl, mediaId || null, "video");
          return;
        }
        const upload =
          kind === "youtubeThumbnail" || kind === "thumbnail"
            ? await uploadUnifiedWorkspaceMediaFromFile(token, ws, file)
            : await uploadWorkspaceImage(token, ws, file);
        const imageUrl =
          "publicUrl" in upload ? upload.publicUrl : upload.image_url;
        const mediaId = "mediaId" in upload ? upload.mediaId || null : null;
        if (!imageUrl?.trim()) {
          setMediaError("Media update failed.");
          return;
        }
        await applyMediaPatch(token, ws, imageUrl, mediaId, kind);
      } catch (e) {
        setMediaError(e instanceof Error ? e.message : "Media update failed.");
      } finally {
        setMediaBusy(false);
      }
    },
    [applyMediaPatch],
  );

  const changeMediaFromUrl = useCallback(
    async (
      url: string,
      mediaId: string | null,
      kind: DraftEditorMediaKind,
    ): Promise<void> => {
      const token = getStoredAccessToken();
      const ws = getStoredActiveWorkspaceId();
      if (!token?.trim() || !ws?.trim()) {
        setMediaError("Not signed in.");
        return;
      }
      setMediaBusy(true);
      setMediaError(null);
      try {
        await applyMediaPatch(token, ws, url, mediaId, kind);
      } catch (e) {
        setMediaError(e instanceof Error ? e.message : "Media update failed.");
      } finally {
        setMediaBusy(false);
      }
    },
    [applyMediaPatch],
  );

  const scheduleDraft = useCallback(
    async (scheduledTimeIso: string): Promise<void> => {
      const token = getStoredAccessToken();
      const ws = getStoredActiveWorkspaceId();
      if (!token?.trim() || !ws?.trim()) {
        setScheduleError("Not signed in.");
        return;
      }
      setScheduleBusy(true);
      setScheduleError(null);
      try {
        await scheduleUnifiedDraftById(token, ws, draftId, scheduledTimeIso);
        dispatchContentManagerDraftRefresh(draftId);
        if (optionsRef.current?.onScheduleSuccess) {
          optionsRef.current.onScheduleSuccess();
        } else {
          router.push("/post-scheduler/calendar");
        }
      } catch (e) {
        setScheduleError(e instanceof Error ? e.message : "Schedule failed.");
      } finally {
        setScheduleBusy(false);
      }
    },
    [draftId, router],
  );

  return {
    mediaBusy,
    mediaError,
    scheduleBusy,
    scheduleError,
    scheduleDraft,
    changeMediaFromFile,
    changeMediaFromUrl,
  };
}
