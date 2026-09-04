"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import {
  getStoredAccessToken,
  getStoredActiveWorkspaceId,
} from "@/lib/auth/session";
import {
  patchWorkspaceScheduledPostById,
  rescheduleWorkspaceScheduledPostById,
} from "@/lib/social/workspaceScheduledPostMutations";
import type { UnifiedScheduledPostItemJson } from "@/lib/social/unifiedScheduledPostsApi";
import { uploadUnifiedWorkspaceMediaFromFile } from "@/lib/social/unifiedMediaUploadWeb";
import { uploadWorkspaceImage } from "@/lib/workspaces/workspaceApi";

import type { DraftEditorMediaKind } from "./useDraftEditorConfirmFlow";

export interface UseScheduledPostEditorScheduleAndImageOptions {
  onRescheduleSuccess?: () => void;
}

/**
 * Media replace patches must also clear stale media ids (media_id /
 * default_image_id / video_id): the unified publisher prefers ids over URLs,
 * so leaving an old id would publish the old media.
 *
 * Image ↔ video swaps must also flip `post_type` on the scheduled row — the
 * worker publishes from `scheduled_post.post_type`, not from which media
 * fields happen to be set.
 */
function imageReplacePatch(
  imageUrl: string,
  mediaId: string | null,
): Record<string, unknown> {
  return {
    default_image_url: imageUrl,
    default_image_id: mediaId,
    media_id: null,
    media_ids: null,
    image_ids: null,
    image_urls: null,
    image_url: null,
    facebook_page_images: null,
    // Clear video so publisher cannot prefer leftover video fields.
    video_url: null,
    video_id: null,
  };
}

function videoReplacePatch(
  videoUrl: string,
  mediaId: string | null,
): Record<string, unknown> {
  return {
    video_url: videoUrl,
    video_id: mediaId,
    media_id: null,
    // Clear image so UI preview + image publisher path cannot win.
    default_image_url: null,
    default_image_id: null,
    media_ids: null,
    image_ids: null,
    image_urls: null,
    image_url: null,
    facebook_page_images: null,
  };
}

function youtubeThumbnailReplacePatch(
  thumbnailUrl: string,
  mediaId: string | null,
): Record<string, unknown> {
  return {
    thumbnail_url: thumbnailUrl,
    thumbnail_image_id: mediaId,
    generate_thumbnail_from_content: false,
  };
}

function postTypeForMediaKind(
  kind: DraftEditorMediaKind,
): string | undefined {
  if (kind === "video") {
    return "video";
  }
  if (kind === "image") {
    return "image";
  }
  return undefined;
}

export function useScheduledPostEditorScheduleAndImage(
  scheduledPostId: string,
  item: UnifiedScheduledPostItemJson,
  setItem: (u: UnifiedScheduledPostItemJson) => void,
  options?: UseScheduledPostEditorScheduleAndImageOptions,
): {
  mediaBusy: boolean;
  mediaError: string | null;
  scheduleBusy: boolean;
  scheduleError: string | null;
  reschedulePost: (scheduledTimeIso: string) => Promise<void>;
  changeMediaFromFile: (file: File, kind: DraftEditorMediaKind) => Promise<void>;
  changeMediaFromUrl: (
    url: string,
    mediaId: string | null,
    kind: DraftEditorMediaKind,
  ) => Promise<void>;
} {
  const optionsRef = useRef(options);
  const itemRef = useRef(item);
  useEffect(() => {
    optionsRef.current = options;
  }, [options]);
  useEffect(() => {
    itemRef.current = item;
  }, [item]);
  const [mediaBusy, setMediaBusy] = useState(false);
  const [mediaError, setMediaError] = useState<string | null>(null);
  const [scheduleBusy, setScheduleBusy] = useState(false);
  const [scheduleError, setScheduleError] = useState<string | null>(null);

  const applyPostDataPatch = useCallback(
    async (
      patch: Record<string, unknown>,
      nextPostType?: string,
    ): Promise<void> => {
      const token = getStoredAccessToken();
      const ws = getStoredActiveWorkspaceId();
      if (!token?.trim() || !ws?.trim()) {
        setMediaError("Not signed in.");
        return;
      }
      const current = itemRef.current;
      const nextPostData: Record<string, unknown> = {
        ...current.post_data,
        ...patch,
      };
      const res = await patchWorkspaceScheduledPostById(
        token,
        ws,
        scheduledPostId,
        current.platform,
        {
          post_data: nextPostData,
          ...(nextPostType ? { post_type: nextPostType } : {}),
        },
      );
      if (!res.success) {
        setMediaError("Media update failed.");
        return;
      }
      const updated = res.data?.scheduled_posts?.find(
        (p) => p.scheduled_post_id === scheduledPostId,
      );
      if (updated) {
        itemRef.current = updated;
        setItem(updated);
      } else {
        const nextItem: UnifiedScheduledPostItemJson = {
          ...current,
          post_data: nextPostData,
          ...(nextPostType ? { post_type: nextPostType } : {}),
        };
        itemRef.current = nextItem;
        setItem(nextItem);
      }
    },
    [scheduledPostId, setItem],
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
          await applyPostDataPatch(
            videoReplacePatch(publicUrl, mediaId || null),
            postTypeForMediaKind("video"),
          );
          return;
        }
        if (kind === "youtubeThumbnail" || kind === "thumbnail") {
          const { mediaId, publicUrl, mediaType } =
            await uploadUnifiedWorkspaceMediaFromFile(token, ws, file);
          if (mediaType !== "image" || !publicUrl.trim()) {
            setMediaError("Choose an image thumbnail.");
            return;
          }
          await applyPostDataPatch(
            youtubeThumbnailReplacePatch(publicUrl, mediaId || null),
          );
          return;
        }
        const { image_url: imageUrl } = await uploadWorkspaceImage(
          token,
          ws,
          file,
        );
        if (!imageUrl?.trim()) {
          setMediaError("Media update failed.");
          return;
        }
        await applyPostDataPatch(
          imageReplacePatch(imageUrl, null),
          postTypeForMediaKind("image"),
        );
      } catch (e) {
        setMediaError(e instanceof Error ? e.message : "Media update failed.");
      } finally {
        setMediaBusy(false);
      }
    },
    [applyPostDataPatch],
  );

  const changeMediaFromUrl = useCallback(
    async (
      url: string,
      mediaId: string | null,
      kind: DraftEditorMediaKind,
    ): Promise<void> => {
      setMediaBusy(true);
      setMediaError(null);
      try {
        if (kind === "video") {
          if (!url.trim()) {
            setMediaError("Media update failed.");
            return;
          }
          await applyPostDataPatch(
            videoReplacePatch(url, mediaId),
            postTypeForMediaKind("video"),
          );
          return;
        }
        if (kind === "youtubeThumbnail" || kind === "thumbnail") {
          await applyPostDataPatch(youtubeThumbnailReplacePatch(url, mediaId));
          return;
        }
        await applyPostDataPatch(
          imageReplacePatch(url, mediaId),
          postTypeForMediaKind("image"),
        );
      } catch (e) {
        setMediaError(e instanceof Error ? e.message : "Media update failed.");
      } finally {
        setMediaBusy(false);
      }
    },
    [applyPostDataPatch],
  );

  const reschedulePost = useCallback(
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
        const current = itemRef.current;
        const res = await rescheduleWorkspaceScheduledPostById(
          token,
          ws,
          scheduledPostId,
          current.platform,
          scheduledTimeIso,
        );
        if (!res.success) {
          setScheduleError("Reschedule failed.");
          return;
        }
        const updated = res.data?.scheduled_posts?.find(
          (p) => p.scheduled_post_id === scheduledPostId,
        );
        if (updated) {
          itemRef.current = updated;
          setItem(updated);
        }
        optionsRef.current?.onRescheduleSuccess?.();
      } catch (e) {
        setScheduleError(e instanceof Error ? e.message : "Reschedule failed.");
      } finally {
        setScheduleBusy(false);
      }
    },
    [scheduledPostId, setItem],
  );

  return {
    mediaBusy,
    mediaError,
    scheduleBusy,
    scheduleError,
    reschedulePost,
    changeMediaFromFile,
    changeMediaFromUrl,
  };
}
