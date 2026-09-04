"use client";

import { useCallback, useEffect, useState } from "react";

import { getStoredAccessToken, getStoredActiveWorkspaceId } from "@/lib/auth/session";
import {
  createCanvaDesign,
  exportCanvaDesign,
  listCanvaDesigns,
  type CanvaDesignListItem,
} from "@/lib/social/canvaApi";
import { openCanvaDesignEditor } from "@/lib/social/openCanvaDesignEditor";
import type { ComposerAttachedMedia } from "@/lib/post-composer/composerAttachedMediaTypes";
import { invalidateUnifiedMediaListCache } from "@/lib/social/unifiedMediaApi";
import type { CanvaDesignDimensions } from "../_components/CanvaDesignDimensionsSelect";

const PAGE_SIZE = 24;

export function useCanvaDesignPicker(options: {
  enabled: boolean;
  searchDebounced: string;
  designDimensions: CanvaDesignDimensions;
  onImport?: (media: ComposerAttachedMedia) => void;
}): {
  items: CanvaDesignListItem[];
  loading: boolean;
  loadingMore: boolean;
  error: string | null;
  hasMore: boolean;
  reload: () => Promise<void>;
  loadMore: () => Promise<void>;
  openDesignInCanva: (item: CanvaDesignListItem) => Promise<void>;
  importDesignToPostsiva: (item: CanvaDesignListItem) => Promise<void>;
  createBlankAndOpen: (postKind?: string) => Promise<void>;
  opening: boolean;
  importingDesignId: string | null;
} {
  const { enabled, searchDebounced, designDimensions, onImport } = options;
  const [items, setItems] = useState<CanvaDesignListItem[]>([]);
  const [continuation, setContinuation] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [opening, setOpening] = useState(false);
  const [importingDesignId, setImportingDesignId] = useState<string | null>(null);

  const loadPage = useCallback(
    async (mode: "reset" | "more", cursor: string | null): Promise<void> => {
      const token = getStoredAccessToken();
      const workspaceId = getStoredActiveWorkspaceId();
      if (!token?.trim() || !workspaceId?.trim()) {
        setItems([]);
        setContinuation(null);
        return;
      }
      if (mode === "reset") {
        setLoading(true);
        setError(null);
      } else {
        setLoadingMore(true);
      }
      try {
        const page = await listCanvaDesigns(token, workspaceId, {
          query: searchDebounced.trim() || undefined,
          limit: PAGE_SIZE,
          continuation: mode === "more" ? cursor ?? undefined : undefined,
        });
        setContinuation(page.continuation);
        setItems((prev) => (mode === "reset" ? page.items : [...prev, ...page.items]));
        setError(null);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Could not load designs");
        if (mode === "reset") {
          setItems([]);
          setContinuation(null);
        }
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [searchDebounced],
  );

  useEffect(() => {
    if (!enabled) {
      return;
    }
    void loadPage("reset", null);
  }, [enabled, searchDebounced, loadPage]);

  const openDesignInCanva = useCallback(async (item: CanvaDesignListItem): Promise<void> => {
    const token = getStoredAccessToken();
    const workspaceId = getStoredActiveWorkspaceId();
    if (!token?.trim() || !workspaceId?.trim()) {
      return;
    }
    setOpening(true);
    setError(null);
    try {
      await openCanvaDesignEditor({
        designId: item.designId,
        editUrl: item.editUrl,
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not open Canva");
    } finally {
      setOpening(false);
    }
  }, []);

  const importDesignToPostsiva = useCallback(
    async (item: CanvaDesignListItem): Promise<void> => {
      const token = getStoredAccessToken();
      const workspaceId = getStoredActiveWorkspaceId();
      if (!token?.trim() || !workspaceId?.trim() || importingDesignId) {
        return;
      }
      setImportingDesignId(item.designId);
      setError(null);
      try {
        const exported = await exportCanvaDesign(token, workspaceId, item.designId);
        invalidateUnifiedMediaListCache();
        onImport?.({
          mediaId: exported.mediaId || exported.uploadId,
          publicUrl: exported.mediaUrl,
          mediaType: "image",
          filename: exported.filename,
          source: "canva",
          canvaDesignId: exported.designId,
        });
      } catch (e) {
        setError(e instanceof Error ? e.message : "Could not import design");
      } finally {
        setImportingDesignId(null);
      }
    },
    [importingDesignId, onImport],
  );

  const createBlankAndOpen = useCallback(
    async (postKind?: string): Promise<void> => {
      const token = getStoredAccessToken();
      const workspaceId = getStoredActiveWorkspaceId();
      if (!token?.trim() || !workspaceId?.trim()) {
        return;
      }
      setOpening(true);
      setError(null);
      try {
        const created = await createCanvaDesign(token, workspaceId, {
          postKind,
          width: designDimensions.width,
          height: designDimensions.height,
        });
        await openDesignInCanva(created);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Could not create design");
        setOpening(false);
      }
    },
    [designDimensions.height, designDimensions.width, openDesignInCanva],
  );

  return {
    items,
    loading,
    loadingMore,
    error,
    hasMore: Boolean(continuation),
    reload: () => loadPage("reset", null),
    loadMore: () => loadPage("more", continuation),
    openDesignInCanva,
    importDesignToPostsiva,
    createBlankAndOpen,
    opening,
    importingDesignId,
  };
}
