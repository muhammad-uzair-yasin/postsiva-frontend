"use client";

import { useCallback, useState } from "react";

import {
  getStoredAccessToken,
  getStoredActiveWorkspaceId,
} from "@/lib/auth/session";
import { dispatchContentManagerDraftRefresh } from "@/lib/contentManager/contentManagerDraftRefresh";
import { dispatchContentManagerScheduledRefresh } from "@/lib/contentManager/contentManagerScheduledRefresh";
import type { ComposerAttachedMedia } from "@/lib/post-composer/composerAttachedMediaTypes";
import { capMainTextForPlatform } from "@/lib/post-composer/composerMainTextCharLimits";
import {
  deleteUnifiedDraftById,
  patchUnifiedDraftById,
  publishUnifiedDraftById,
  scheduleUnifiedDraftById,
} from "@/lib/social/unifiedDraftsApi";
import {
  deleteWorkspaceScheduledPostById,
  moveWorkspaceScheduledPostToDraftById,
  patchWorkspaceScheduledPostById,
  publishWorkspaceScheduledPostById,
} from "@/lib/social/workspaceScheduledPostMutations";

import { usePostSchedulerComposerDraft } from "../../post-scheduler/_context/PostSchedulerComposerDraftContext";

function patchBodyFromComposerMedia(
  media: readonly ComposerAttachedMedia[],
): Record<string, unknown> {
  const video = media.find((m) => m.mediaType === "video");
  if (video) {
    return {
      video_url: video.publicUrl,
      video_id: video.mediaId || null,
    };
  }
  const images = media.filter((m) => m.mediaType === "image");
  if (images.length >= 2) {
    return {
      image_urls: images.map((m) => m.publicUrl),
      image_ids: images.map((m) => m.mediaId || null),
    };
  }
  if (images.length === 1) {
    return {
      default_image_url: images[0].publicUrl,
      default_image_id: images[0].mediaId || null,
    };
  }
  return {};
}

export function useSocialComposerEditActions(input: {
  readonly mode: "draft" | "scheduled";
  readonly draftId?: string;
  readonly scheduledPostId?: string;
  readonly platform: string;
  readonly onSaved?: () => void;
  readonly onScheduled?: () => void;
  readonly onPublished?: () => void;
  readonly onDeleted?: () => void;
  readonly onMovedToDraft?: () => void;
}): {
  readonly busy: boolean;
  readonly error: string | null;
  readonly save: () => Promise<boolean>;
  readonly schedule: (isoUtc: string) => Promise<boolean>;
  readonly reschedule: (isoUtc: string) => Promise<boolean>;
  readonly publish: () => Promise<boolean>;
  readonly remove: () => Promise<boolean>;
  readonly moveToDraft: () => Promise<boolean>;
} {
  const { unifiedBody, unifiedMedia } = usePostSchedulerComposerDraft();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const save = useCallback(async (): Promise<boolean> => {
    const token = getStoredAccessToken();
    const ws = getStoredActiveWorkspaceId();
    if (!token?.trim() || !ws?.trim()) {
      setError("Not signed in.");
      return false;
    }
    setBusy(true);
    setError(null);
    try {
      const text = capMainTextForPlatform(unifiedBody, input.platform);
      const mediaPatch = patchBodyFromComposerMedia(unifiedMedia);
      if (input.mode === "draft" && input.draftId) {
        const res = await patchUnifiedDraftById(token, ws, input.draftId, {
          default_text: text,
          ...mediaPatch,
        });
        if (!res.success) {
          setError("Update failed.");
          return false;
        }
        dispatchContentManagerDraftRefresh();
        input.onSaved?.();
        return true;
      }
      if (input.mode === "scheduled" && input.scheduledPostId) {
        const res = await patchWorkspaceScheduledPostById(
          token,
          ws,
          input.scheduledPostId,
          input.platform,
          {
            post_data: {
              default_text: text,
              ...mediaPatch,
            },
          },
        );
        if (!res.success) {
          setError("Update failed.");
          return false;
        }
        dispatchContentManagerScheduledRefresh();
        input.onSaved?.();
        return true;
      }
      setError("Update failed.");
      return false;
    } catch (e) {
      setError(e instanceof Error ? e.message : "Update failed.");
      return false;
    } finally {
      setBusy(false);
    }
  }, [
    input.draftId,
    input.mode,
    input.onSaved,
    input.platform,
    input.scheduledPostId,
    unifiedBody,
    unifiedMedia,
  ]);

  const schedule = useCallback(
    async (isoUtc: string): Promise<boolean> => {
      if (input.mode !== "draft" || !input.draftId) {
        return false;
      }
      const token = getStoredAccessToken();
      const ws = getStoredActiveWorkspaceId();
      if (!token?.trim() || !ws?.trim()) {
        setError("Not signed in.");
        return false;
      }
      setBusy(true);
      setError(null);
      try {
        const ok = await save();
        if (!ok) {
          return false;
        }
        await scheduleUnifiedDraftById(token, ws, input.draftId, isoUtc);
        dispatchContentManagerDraftRefresh();
        dispatchContentManagerScheduledRefresh();
        input.onScheduled?.();
        return true;
      } catch (e) {
        setError(e instanceof Error ? e.message : "Schedule failed.");
        return false;
      } finally {
        setBusy(false);
      }
    },
    [input.draftId, input.mode, input.onScheduled, save],
  );

  const reschedule = useCallback(
    async (isoUtc: string): Promise<boolean> => {
      if (input.mode !== "scheduled" || !input.scheduledPostId) {
        return false;
      }
      const token = getStoredAccessToken();
      const ws = getStoredActiveWorkspaceId();
      if (!token?.trim() || !ws?.trim()) {
        setError("Not signed in.");
        return false;
      }
      setBusy(true);
      setError(null);
      try {
        const ok = await save();
        if (!ok) {
          return false;
        }
        const res = await patchWorkspaceScheduledPostById(
          token,
          ws,
          input.scheduledPostId,
          input.platform,
          { scheduled_time: isoUtc },
        );
        if (!res.success) {
          setError("Reschedule failed.");
          return false;
        }
        dispatchContentManagerScheduledRefresh();
        input.onScheduled?.();
        return true;
      } catch (e) {
        setError(e instanceof Error ? e.message : "Reschedule failed.");
        return false;
      } finally {
        setBusy(false);
      }
    },
    [
      input.mode,
      input.onScheduled,
      input.platform,
      input.scheduledPostId,
      save,
    ],
  );

  const publish = useCallback(async (): Promise<boolean> => {
    const token = getStoredAccessToken();
    const ws = getStoredActiveWorkspaceId();
    if (!token?.trim() || !ws?.trim()) {
      setError("Not signed in.");
      return false;
    }
    setBusy(true);
    setError(null);
    try {
      const ok = await save();
      if (!ok) {
        return false;
      }
      if (input.mode === "draft" && input.draftId) {
        await publishUnifiedDraftById(token, ws, input.draftId);
        dispatchContentManagerDraftRefresh();
        input.onPublished?.();
        return true;
      }
      if (input.mode === "scheduled" && input.scheduledPostId) {
        await publishWorkspaceScheduledPostById(
          token,
          ws,
          input.scheduledPostId,
          input.platform,
        );
        dispatchContentManagerScheduledRefresh();
        input.onPublished?.();
        return true;
      }
      return false;
    } catch (e) {
      setError(e instanceof Error ? e.message : "Publish failed.");
      return false;
    } finally {
      setBusy(false);
    }
  }, [
    input.draftId,
    input.mode,
    input.onPublished,
    input.platform,
    input.scheduledPostId,
    save,
  ]);

  const remove = useCallback(async (): Promise<boolean> => {
    const token = getStoredAccessToken();
    const ws = getStoredActiveWorkspaceId();
    if (!token?.trim() || !ws?.trim()) {
      setError("Not signed in.");
      return false;
    }
    setBusy(true);
    setError(null);
    try {
      if (input.mode === "draft" && input.draftId) {
        await deleteUnifiedDraftById(token, ws, input.draftId);
        dispatchContentManagerDraftRefresh();
        input.onDeleted?.();
        return true;
      }
      if (input.mode === "scheduled" && input.scheduledPostId) {
        await deleteWorkspaceScheduledPostById(
          token,
          ws,
          input.scheduledPostId,
          input.platform,
        );
        dispatchContentManagerScheduledRefresh();
        input.onDeleted?.();
        return true;
      }
      return false;
    } catch (e) {
      setError(e instanceof Error ? e.message : "Delete failed.");
      return false;
    } finally {
      setBusy(false);
    }
  }, [
    input.draftId,
    input.mode,
    input.onDeleted,
    input.platform,
    input.scheduledPostId,
  ]);

  const moveToDraft = useCallback(async (): Promise<boolean> => {
    if (input.mode !== "scheduled" || !input.scheduledPostId) {
      return false;
    }
    const token = getStoredAccessToken();
    const ws = getStoredActiveWorkspaceId();
    if (!token?.trim() || !ws?.trim()) {
      setError("Not signed in.");
      return false;
    }
    setBusy(true);
    setError(null);
    try {
      await moveWorkspaceScheduledPostToDraftById(
        token,
        ws,
        input.scheduledPostId,
        input.platform,
      );
      dispatchContentManagerScheduledRefresh();
      dispatchContentManagerDraftRefresh();
      input.onMovedToDraft?.();
      return true;
    } catch (e) {
      setError(e instanceof Error ? e.message : "Move failed.");
      return false;
    } finally {
      setBusy(false);
    }
  }, [input.mode, input.onMovedToDraft, input.platform, input.scheduledPostId]);

  return {
    busy,
    error,
    save,
    schedule,
    reschedule,
    publish,
    remove,
    moveToDraft,
  };
}
