"use client";

import { useCallback, useState } from "react";

import { getStoredAccessToken, getStoredActiveWorkspaceId } from "@/lib/auth/session";
import { dispatchContentManagerDraftRefresh } from "@/lib/contentManager/contentManagerDraftRefresh";
import { buildWordPressUnifiedPatchBody } from "@/lib/post-composer/buildWordPressUnifiedPatchBody";
import { buildWordPressComposerFields } from "@/lib/post-composer/wordpressComposerFields";
import {
  deleteUnifiedBlogDraftById,
  patchUnifiedBlogDraftById,
  publishUnifiedBlogDraftById,
  scheduleUnifiedBlogDraftById,
  type UnifiedDraftResponseJson,
} from "@/lib/social/unifiedBlogDraftsApi";
import {
  deleteUnifiedBlogScheduledPostById,
  moveUnifiedBlogScheduledPostToDraftById,
  patchUnifiedBlogScheduledPostById,
  publishUnifiedBlogScheduledPostById,
} from "@/lib/social/unifiedBlogScheduledPostsApi";
import type { UnifiedScheduledPostItemJson } from "@/lib/social/unifiedScheduledPostsApi";
import { usePrepareWordPressTermsForPublish } from "../../post-scheduler/_hooks/usePrepareWordPressTermsForPublish";
import { usePostSchedulerComposerDraft } from "../../post-scheduler/_context/PostSchedulerComposerDraftContext";

export function useWordPressUnifiedEditActions(input: {
  readonly mode: "draft" | "scheduled";
  readonly draftId?: string;
  readonly scheduledPostId?: string;
  readonly connectionId: string;
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
  const {
    unifiedMedia,
    wordpressTitle,
    wordpressSlug,
    wordpressContent,
    wordpressExcerpt,
    wordpressCategories,
    wordpressTags,
    wordpressSuggestedCategoryNames,
    wordpressSuggestedTagNames,
    wordpressRecommendedImages,
  } = usePostSchedulerComposerDraft();
  const prepareWordpressFields = usePrepareWordPressTermsForPublish();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const buildPatchBody = useCallback(async (): Promise<Record<string, unknown>> => {
    const baseFields = buildWordPressComposerFields({
      title: wordpressTitle,
      slug: wordpressSlug,
      content: wordpressContent,
      excerpt: wordpressExcerpt,
      categories: wordpressCategories,
      tags: wordpressTags,
      suggestedCategoryNames: wordpressSuggestedCategoryNames,
      suggestedTagNames: wordpressSuggestedTagNames,
      recommendedImages: wordpressRecommendedImages,
      attachedMedia: unifiedMedia,
    });
    const resolved = await prepareWordpressFields({
      title: baseFields.title,
      slug: baseFields.slug,
      content: baseFields.content,
      excerpt: baseFields.excerpt,
      categories: baseFields.categories,
      tags: baseFields.tags,
      suggestedCategoryNames: baseFields.suggestedCategoryNames,
      suggestedTagNames: baseFields.suggestedTagNames,
      featuredMediaId: baseFields.featuredMediaId,
      featuredImageUrl: baseFields.featuredImageUrl,
    });
    return buildWordPressUnifiedPatchBody({
      connectionId: input.connectionId,
      title: resolved.title,
      slug: resolved.slug,
      content: resolved.content,
      excerpt: resolved.excerpt,
      categories: resolved.categories,
      tags: resolved.tags,
      suggestedCategoryNames: resolved.suggestedCategoryNames ?? [],
      suggestedTagNames: resolved.suggestedTagNames ?? [],
      media: unifiedMedia,
      featuredMediaId: resolved.featuredMediaId,
      recommendedImages: wordpressRecommendedImages,
    });
  }, [
    input.connectionId,
    prepareWordpressFields,
    unifiedMedia,
    wordpressCategories,
    wordpressContent,
    wordpressExcerpt,
    wordpressRecommendedImages,
    wordpressSlug,
    wordpressSuggestedCategoryNames,
    wordpressSuggestedTagNames,
    wordpressTags,
    wordpressTitle,
  ]);

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
      const body = await buildPatchBody();
      if (input.mode === "draft" && input.draftId) {
        const res = await patchUnifiedBlogDraftById(token, ws, input.draftId, body);
        if (!res.success) {
          setError("Update failed.");
          return false;
        }
        input.onSaved?.();
        return true;
      }
      if (input.mode === "scheduled" && input.scheduledPostId) {
        const res = await patchUnifiedBlogScheduledPostById(token, ws, input.scheduledPostId, {
          post_data: body,
        });
        if (!res.success) {
          setError("Update failed.");
          return false;
        }
        input.onSaved?.();
        return true;
      }
      setError("Nothing to save.");
      return false;
    } catch (e) {
      setError(e instanceof Error ? e.message : "Update failed.");
      return false;
    } finally {
      setBusy(false);
    }
  }, [buildPatchBody, input]);

  const schedule = useCallback(
    async (isoUtc: string): Promise<boolean> => {
      if (input.mode !== "draft" || !input.draftId) {
        return false;
      }
      const saved = await save();
      if (!saved) {
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
        await scheduleUnifiedBlogDraftById(token, ws, input.draftId, isoUtc);
        dispatchContentManagerDraftRefresh(input.draftId);
        input.onScheduled?.();
        return true;
      } catch (e) {
        setError(e instanceof Error ? e.message : "Schedule failed.");
        return false;
      } finally {
        setBusy(false);
      }
    },
    [input, save],
  );

  const reschedule = useCallback(
    async (isoUtc: string): Promise<boolean> => {
      if (input.mode !== "scheduled" || !input.scheduledPostId) {
        return false;
      }
      const saved = await save();
      if (!saved) {
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
        const res = await patchUnifiedBlogScheduledPostById(
          token,
          ws,
          input.scheduledPostId,
          { scheduled_time: isoUtc },
        );
        if (!res.success) {
          setError("Reschedule failed.");
          return false;
        }
        input.onScheduled?.();
        return true;
      } catch (e) {
        setError(e instanceof Error ? e.message : "Reschedule failed.");
        return false;
      } finally {
        setBusy(false);
      }
    },
    [input, save],
  );

  const publish = useCallback(async (): Promise<boolean> => {
    const saved = await save();
    if (!saved) {
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
      if (input.mode === "draft" && input.draftId) {
        await publishUnifiedBlogDraftById(token, ws, input.draftId);
        input.onPublished?.();
        return true;
      }
      if (input.mode === "scheduled" && input.scheduledPostId) {
        await publishUnifiedBlogScheduledPostById(token, ws, input.scheduledPostId);
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
  }, [input, save]);

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
        await deleteUnifiedBlogDraftById(token, ws, input.draftId);
        input.onDeleted?.();
        return true;
      }
      if (input.mode === "scheduled" && input.scheduledPostId) {
        await deleteUnifiedBlogScheduledPostById(token, ws, input.scheduledPostId);
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
  }, [input]);

  const moveToDraft = useCallback(async (): Promise<boolean> => {
    if (input.mode !== "scheduled" || !input.scheduledPostId) {
      return false;
    }
    const saved = await save();
    if (!saved) {
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
      await moveUnifiedBlogScheduledPostToDraftById(token, ws, input.scheduledPostId);
      input.onMovedToDraft?.();
      return true;
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not move to drafts.");
      return false;
    } finally {
      setBusy(false);
    }
  }, [input, save]);

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

export type { UnifiedDraftResponseJson, UnifiedScheduledPostItemJson };
