"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

import {
  getStoredAccessToken,
  getStoredActiveWorkspaceId,
} from "@/lib/auth/session";
import {
  deleteUnifiedDraftById,
  fetchUnifiedDraftById,
  patchUnifiedDraftById,
  publishUnifiedDraftById,
  type UnifiedDraftResponseJson,
} from "@/lib/social/unifiedDraftsApi";
import { capMainTextForPlatform } from "@/lib/post-composer/composerMainTextCharLimits";
import type { PostingDestinationFromHeaderAccount } from "@/lib/workspace/resolvePostingDestinationFromHeaderAccount";

export interface UseDraftEditorActionsCallbacks {
  /** After publish/delete API success, before navigation (e.g. close modal). */
  onAfterPublishOrDelete?: () => void;
  /** After publish API success, before onAfterPublishOrDelete (e.g. toast). */
  onPublishSuccess?: () => void;
  /** After delete API success, before onAfterPublishOrDelete (e.g. toast). */
  onDeleteSuccess?: () => void;
}

export function useDraftEditorActions(
  draftId: string,
  caption: string,
  platform: string | null | undefined,
  setDraft: (d: UnifiedDraftResponseJson) => void,
  setCaption: (v: string) => void,
  extraPostDataPatch?: Record<string, unknown>,
  callbacks?: UseDraftEditorActionsCallbacks,
): {
  isSaving: boolean;
  actionError: string | null;
  save: (extraPostDataPatch?: Record<string, unknown>) => Promise<boolean>;
  publish: () => Promise<void>;
  remove: () => Promise<void>;
  changeAccount: (dest: PostingDestinationFromHeaderAccount) => Promise<boolean>;
} {
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const callbacksRef = useRef(callbacks);
  useEffect(() => {
    callbacksRef.current = callbacks;
  }, [callbacks]);

  const save = useCallback(async (
    saveExtraPostDataPatch?: Record<string, unknown>,
  ): Promise<boolean> => {
    const token = getStoredAccessToken();
    const ws = getStoredActiveWorkspaceId();
    if (!token?.trim() || !ws?.trim()) {
      setActionError("Not signed in.");
      return false;
    }
    setIsSaving(true);
    setActionError(null);
    try {
      const text = capMainTextForPlatform(caption, platform);
      const res = await patchUnifiedDraftById(token, ws, draftId, {
        default_text: text,
        ...(extraPostDataPatch ?? {}),
        ...(saveExtraPostDataPatch ?? {}),
      });
      if (!res.success || !res.data) {
        setActionError("Update failed.");
        return false;
      }
      try {
        const fresh = await fetchUnifiedDraftById(token, ws, draftId);
        if (fresh.success && fresh.data) {
          setDraft(fresh.data);
          setCaption(fresh.data.default_text?.trim() ?? "");
        } else {
          setDraft(res.data);
          setCaption(res.data.default_text?.trim() ?? "");
        }
      } catch {
        setDraft(res.data);
        setCaption(res.data.default_text?.trim() ?? "");
      }
      return true;
    } catch (e) {
      setActionError(e instanceof Error ? e.message : "Update failed.");
      return false;
    } finally {
      setIsSaving(false);
    }
  }, [caption, draftId, extraPostDataPatch, platform, setDraft, setCaption]);

  const publish = useCallback(async (): Promise<void> => {
    const token = getStoredAccessToken();
    const ws = getStoredActiveWorkspaceId();
    if (!token?.trim() || !ws?.trim()) {
      setActionError("Not signed in.");
      return;
    }
    setIsSaving(true);
    setActionError(null);
    try {
      await publishUnifiedDraftById(token, ws, draftId);
      callbacksRef.current?.onPublishSuccess?.();
      callbacksRef.current?.onAfterPublishOrDelete?.();
      router.push("/drafts");
    } catch (e) {
      setActionError(e instanceof Error ? e.message : "Publish failed.");
    } finally {
      setIsSaving(false);
    }
  }, [draftId, router]);

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
      await deleteUnifiedDraftById(token, ws, draftId);
      callbacksRef.current?.onDeleteSuccess?.();
      callbacksRef.current?.onAfterPublishOrDelete?.();
      router.push("/drafts");
    } catch (e) {
      setActionError(e instanceof Error ? e.message : "Delete failed.");
    } finally {
      setIsSaving(false);
    }
  }, [draftId, router]);

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
        const res = await patchUnifiedDraftById(token, ws, draftId, {
          platform: dest.platform,
          platform_user_id: dest.platformUserId,
          ...dest.postDataPatch,
        });
        if (!res.success || !res.data) {
          setActionError("Could not change account.");
          return false;
        }
        try {
          const fresh = await fetchUnifiedDraftById(token, ws, draftId);
          if (fresh.success && fresh.data) {
            setDraft(fresh.data);
            setCaption(fresh.data.default_text?.trim() ?? "");
          } else {
            setDraft(res.data);
            setCaption(res.data.default_text?.trim() ?? "");
          }
        } catch {
          setDraft(res.data);
          setCaption(res.data.default_text?.trim() ?? "");
        }
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
    [draftId, setCaption, setDraft],
  );

  return { isSaving, actionError, save, publish, remove, changeAccount };
}
