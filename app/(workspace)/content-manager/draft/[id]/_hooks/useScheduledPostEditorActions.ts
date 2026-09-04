"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

import {
  getStoredAccessToken,
  getStoredActiveWorkspaceId,
} from "@/lib/auth/session";
import {
  deleteWorkspaceScheduledPostById,
  moveWorkspaceScheduledPostToDraftById,
  patchWorkspaceScheduledPostById,
  publishWorkspaceScheduledPostById,
} from "@/lib/social/workspaceScheduledPostMutations";
import type { UnifiedScheduledPostItemJson } from "@/lib/social/unifiedScheduledPostsApi";
import { parseWordPressFromScheduledPostData } from "@/lib/post-composer/parseWordPressScheduledPostData";
import { capMainTextForPlatform } from "@/lib/post-composer/composerMainTextCharLimits";
import type { PostingDestinationFromHeaderAccount } from "@/lib/workspace/resolvePostingDestinationFromHeaderAccount";
import { dispatchContentManagerScheduledRefresh } from "@/lib/contentManager/contentManagerScheduledRefresh";

export interface UseScheduledPostEditorActionsCallbacks {
  onAfterClose?: () => void;
  onPublishSuccess?: () => void;
  onMoveToDraftSuccess?: () => void;
  onDeleteSuccess?: () => void;
}

export function useScheduledPostEditorActions(
  scheduledPostId: string,
  caption: string,
  item: UnifiedScheduledPostItemJson,
  setItem: (u: UnifiedScheduledPostItemJson) => void,
  extraPostDataPatch?: Record<string, unknown>,
  callbacks?: UseScheduledPostEditorActionsCallbacks,
): {
  isSaving: boolean;
  isPublishing: boolean;
  actionError: string | null;
  save: (opts?: { silent?: boolean }) => Promise<boolean>;
  publish: () => Promise<void>;
  remove: () => Promise<void>;
  moveToDraft: () => Promise<void>;
  changeAccount: (dest: PostingDestinationFromHeaderAccount) => Promise<boolean>;
} {
  const router = useRouter();
  const callbacksRef = useRef(callbacks);
  const itemRef = useRef(item);
  const captionRef = useRef(caption);
  const extraPatchRef = useRef(extraPostDataPatch);
  useEffect(() => {
    callbacksRef.current = callbacks;
  }, [callbacks]);
  useEffect(() => {
    itemRef.current = item;
  }, [item]);
  useEffect(() => {
    captionRef.current = caption;
  }, [caption]);
  useEffect(() => {
    extraPatchRef.current = extraPostDataPatch;
  }, [extraPostDataPatch]);
  const [isSaving, setIsSaving] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const save = useCallback(async (opts?: { silent?: boolean }): Promise<boolean> => {
    const token = getStoredAccessToken();
    const ws = getStoredActiveWorkspaceId();
    if (!token?.trim() || !ws?.trim()) {
      setActionError("Not signed in.");
      return false;
    }
    const manageBusy = !opts?.silent;
    if (manageBusy) {
      setIsSaving(true);
    }
    setActionError(null);
    try {
      const current = itemRef.current;
      const text = capMainTextForPlatform(captionRef.current, current.platform);
      // Keep text/default_text/caption/message in sync — Calendar reads `text` first.
      // Always merge from the latest item so a prior media replace is not overwritten
      // by a stale closure still holding the old image post_data.
      const nextPostData: Record<string, unknown> = {
        ...current.post_data,
        default_text: text,
        text,
        caption: text,
        message: text,
        ...(extraPatchRef.current ?? {}),
      };
      if (current.platform?.trim().toLowerCase() === "wordpress") {
        const wp = parseWordPressFromScheduledPostData(nextPostData);
        if (wp) {
          nextPostData.wordpress = {
            ...wp,
            wordpress_excerpt: text,
          };
          const payload = nextPostData.wordpress_payload;
          if (
            payload !== null &&
            typeof payload === "object" &&
            !Array.isArray(payload)
          ) {
            nextPostData.wordpress_payload = {
              ...(payload as Record<string, unknown>),
              excerpt: text,
            };
          }
        }
      }
      const res = await patchWorkspaceScheduledPostById(
        token,
        ws,
        scheduledPostId,
        current.platform,
        {
          post_data: nextPostData,
        },
      );
      if (!res.success) {
        setActionError("Update failed.");
        return false;
      }
      const updated = res.data?.scheduled_posts?.find(
        (p) => p.scheduled_post_id === scheduledPostId,
      );
      if (updated) {
        itemRef.current = updated;
        setItem(updated);
      } else {
        const nextItem = {
          ...current,
          post_data: nextPostData,
        };
        itemRef.current = nextItem;
        setItem(nextItem);
      }
      return true;
    } catch (e) {
      setActionError(e instanceof Error ? e.message : "Update failed.");
      return false;
    } finally {
      if (manageBusy) {
        setIsSaving(false);
      }
    }
  }, [scheduledPostId, setItem]);

  const publish = useCallback(async (): Promise<void> => {
    const token = getStoredAccessToken();
    const ws = getStoredActiveWorkspaceId();
    if (!token?.trim() || !ws?.trim()) {
      setActionError("Not signed in.");
      return;
    }
    setIsPublishing(true);
    setIsSaving(true);
    setActionError(null);
    try {
      // Persist caption / optional fields before publish-now so the worker
      // sees the latest editor state (media replace already PATCHes itself).
      const saved = await save({ silent: true });
      if (!saved) {
        return;
      }
      await publishWorkspaceScheduledPostById(
        token,
        ws,
        scheduledPostId,
        itemRef.current.platform,
      );
      callbacksRef.current?.onPublishSuccess?.();
      callbacksRef.current?.onAfterClose?.();
      router.push("/content-manager?tab=published");
    } catch (e) {
      setActionError(e instanceof Error ? e.message : "Publish failed.");
    } finally {
      setIsPublishing(false);
      setIsSaving(false);
    }
  }, [router, save, scheduledPostId]);

  const remove = useCallback(async (): Promise<void> => {
    const token = getStoredAccessToken();
    const ws = getStoredActiveWorkspaceId();
    if (!token?.trim() || !ws?.trim()) {
      setActionError("Not signed in.");
      return;
    }
    setIsSaving(true);
    setActionError(null);
    try {
      await deleteWorkspaceScheduledPostById(
        token,
        ws,
        scheduledPostId,
        item.platform,
      );
      callbacksRef.current?.onDeleteSuccess?.();
      callbacksRef.current?.onAfterClose?.();
      // Do NOT router.push here — the calendar page is already the current page.
      // Pushing causes a redundant soft-nav that delays the finally block,
      // keeping isSaving=true when the next post's editor opens.
    } catch (e) {
      setActionError(e instanceof Error ? e.message : "Delete failed.");
    } finally {
      setIsSaving(false);
    }
  }, [item.platform, scheduledPostId]);

  const moveToDraft = useCallback(async (): Promise<void> => {
    const token = getStoredAccessToken();
    const ws = getStoredActiveWorkspaceId();
    if (!token?.trim() || !ws?.trim()) {
      setActionError("Not signed in.");
      return;
    }
    setIsSaving(true);
    setActionError(null);
    try {
      await moveWorkspaceScheduledPostToDraftById(
        token,
        ws,
        scheduledPostId,
        item.platform,
      );
      callbacksRef.current?.onMoveToDraftSuccess?.();
      callbacksRef.current?.onAfterClose?.();
      router.push("/drafts");
    } catch (e) {
      setActionError(
        e instanceof Error ? e.message : "Could not move to drafts.",
      );
    } finally {
      setIsSaving(false);
    }
  }, [item.platform, router, scheduledPostId]);

  const changeAccount = useCallback(
    async (dest: PostingDestinationFromHeaderAccount): Promise<boolean> => {
      const token = getStoredAccessToken();
      const ws = getStoredActiveWorkspaceId();
      if (!token?.trim() || !ws?.trim()) {
        setActionError("Not signed in.");
        return false;
      }
      setIsSaving(true);
      setActionError(null);
      try {
        const current = itemRef.current;
        const nextPostData: Record<string, unknown> = {
          ...current.post_data,
          ...dest.postDataPatch,
        };
        const res = await patchWorkspaceScheduledPostById(
          token,
          ws,
          scheduledPostId,
          current.platform,
          {
            platform: dest.platform,
            platform_user_id: dest.platformUserId,
            post_data: nextPostData,
          },
        );
        if (!res.success) {
          setActionError("Could not change account.");
          return false;
        }
        const updated = res.data?.scheduled_posts?.find(
          (p) => p.scheduled_post_id === scheduledPostId,
        );
        const nextItem = updated ?? {
          ...current,
          platform: dest.platform,
          platform_user_id: dest.platformUserId,
          post_data: nextPostData,
        };
        itemRef.current = nextItem;
        setItem(nextItem);
        dispatchContentManagerScheduledRefresh();
        return true;
      } catch (e) {
        setActionError(
          e instanceof Error ? e.message : "Could not change account.",
        );
        return false;
      } finally {
        setIsSaving(false);
      }
    },
    [scheduledPostId, setItem],
  );

  return { isSaving, isPublishing, actionError, save, publish, remove, moveToDraft, changeAccount };
}
