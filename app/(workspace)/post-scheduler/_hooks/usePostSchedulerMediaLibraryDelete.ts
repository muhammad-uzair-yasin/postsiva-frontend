"use client";

import { useCallback, useState } from "react";

import { getStoredAccessToken, getStoredActiveWorkspaceId } from "@/lib/auth/session";
import { SCHEDULED_MEDIA_BLOCK_MESSAGE } from "@/lib/post-composer/collectScheduledPostMediaIds";
import { bulkDeleteWorkspaceMedia } from "@/lib/social/unifiedMediaApi";

export interface UsePostSchedulerMediaLibraryDeleteResult {
  selectionMode: boolean;
  setSelectionMode: (next: boolean) => void;
  selectedIds: ReadonlySet<string>;
  toggleSelected: (mediaId: string, scheduledLockedIds: ReadonlySet<string>) => void;
  clearSelection: () => void;
  deleting: boolean;
  deleteError: string | null;
  clearDeleteError: () => void;
  deleteSelected: (
    scheduledLockedIds: ReadonlySet<string>,
    onDeleted: (deletedIds: readonly string[]) => void | Promise<void>,
  ) => Promise<void>;
  deleteOne: (
    mediaId: string,
    scheduledLockedIds: ReadonlySet<string>,
    onDeleted: (deletedIds: readonly string[]) => void | Promise<void>,
  ) => Promise<void>;
}

export function usePostSchedulerMediaLibraryDelete(): UsePostSchedulerMediaLibraryDeleteResult {
  const [selectionMode, setSelectionModeState] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(() => new Set());
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const setSelectionMode = useCallback((next: boolean) => {
    setSelectionModeState(next);
    if (!next) {
      setSelectedIds(new Set());
      setDeleteError(null);
    }
  }, []);

  const toggleSelected = useCallback(
    (mediaId: string, scheduledLockedIds: ReadonlySet<string>) => {
      if (scheduledLockedIds.has(mediaId) && !selectedIds.has(mediaId)) {
        setDeleteError(SCHEDULED_MEDIA_BLOCK_MESSAGE);
        return;
      }
      setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(mediaId)) {
        next.delete(mediaId);
      } else {
        next.add(mediaId);
      }
      return next;
    });
    setDeleteError(null);
  }, [selectedIds]);

  const clearSelection = useCallback(() => {
    setSelectedIds(new Set());
    setDeleteError(null);
  }, []);

  const clearDeleteError = useCallback(() => {
    setDeleteError(null);
  }, []);

  const runDelete = useCallback(
    async (
      mediaIds: readonly string[],
      scheduledLockedIds: ReadonlySet<string>,
      onDeleted: (deletedIds: readonly string[]) => void | Promise<void>,
      options?: { confirmMessage?: string },
    ): Promise<void> => {
      const selected = [...mediaIds];
      if (selected.length === 0) {
        return;
      }

      const blocked = selected.filter((id) => scheduledLockedIds.has(id));
      const allowed = selected.filter((id) => !scheduledLockedIds.has(id));

      if (blocked.length > 0 && allowed.length === 0) {
        setDeleteError(SCHEDULED_MEDIA_BLOCK_MESSAGE);
        return;
      }

      if (blocked.length > 0) {
        setDeleteError(SCHEDULED_MEDIA_BLOCK_MESSAGE);
      } else {
        setDeleteError(null);
      }

      if (allowed.length === 0) {
        return;
      }

      const token = getStoredAccessToken();
      const workspaceId = getStoredActiveWorkspaceId();
      if (!token?.trim() || !workspaceId?.trim()) {
        setDeleteError("Sign in and select a workspace to delete media.");
        return;
      }

      if (options?.confirmMessage) {
        const confirmed = window.confirm(options.confirmMessage);
        if (!confirmed) {
          return;
        }
      }

      setDeleting(true);
      try {
        const result = await bulkDeleteWorkspaceMedia(token, workspaceId, allowed);
        const failedIds = new Set((result.errors ?? []).map((e) => e.media_id));
        const deletedIds = allowed.filter((id) => !failedIds.has(id));

        if (deletedIds.length > 0) {
          await onDeleted(deletedIds);
          setSelectedIds((prev) => {
            const next = new Set(prev);
            for (const id of deletedIds) {
              next.delete(id);
            }
            return next;
          });
        }

        const scheduledFailures = (result.errors ?? []).filter((e) =>
          e.error.toLowerCase().includes("scheduled post"),
        );
        if (scheduledFailures.length > 0) {
          setDeleteError(SCHEDULED_MEDIA_BLOCK_MESSAGE);
        } else if (result.failed_count > 0 && deletedIds.length === 0) {
          const first = result.errors?.[0]?.error;
          setDeleteError(first ?? "Could not delete selected media.");
        } else if (deletedIds.length > 0 && result.failed_count === 0) {
          setSelectionMode(false);
        }
      } catch (e) {
        setDeleteError(e instanceof Error ? e.message : "Delete failed.");
      } finally {
        setDeleting(false);
      }
    },
    [setSelectionMode],
  );

  const deleteSelected = useCallback(
    async (
      scheduledLockedIds: ReadonlySet<string>,
      onDeleted: (deletedIds: readonly string[]) => void | Promise<void>,
    ): Promise<void> => {
      const selected = [...selectedIds];
      await runDelete(selected, scheduledLockedIds, onDeleted, {
        confirmMessage: `Delete ${selected.length} item${selected.length === 1 ? "" : "s"} from your library? This removes them from storage and cannot be undone.`,
      });
    },
    [runDelete, selectedIds],
  );

  const deleteOne = useCallback(
    async (
      mediaId: string,
      scheduledLockedIds: ReadonlySet<string>,
      onDeleted: (deletedIds: readonly string[]) => void | Promise<void>,
    ): Promise<void> => {
      await runDelete([mediaId], scheduledLockedIds, onDeleted);
    },
    [runDelete],
  );

  return {
    selectionMode,
    setSelectionMode,
    selectedIds,
    toggleSelected,
    clearSelection,
    deleting,
    deleteError,
    clearDeleteError,
    deleteSelected,
    deleteOne,
  };
}
