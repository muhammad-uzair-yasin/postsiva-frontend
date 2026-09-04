"use client";

import { useCallback, useEffect, useState } from "react";

import { getStoredAccessToken, getStoredActiveWorkspaceId } from "@/lib/auth/session";
import {
  deleteWordPressMedia,
  fetchWordPressMedia,
  uploadWordPressMedia,
  type WordPressMediaItem,
} from "@/lib/social/wordpressMediaApi";
import {
  createWordPressTerm,
  deleteWordPressTerm,
  fetchWordPressTerms,
  type WordPressTerm,
  type WordPressTermKind,
} from "@/lib/social/wordpressTaxonomyApi";

export interface WordPressEditorResources {
  categories: WordPressTerm[];
  tags: WordPressTerm[];
  media: WordPressMediaItem[];
  loading: boolean;
  error: string | null;
  refresh: (forceRefresh?: boolean) => Promise<void>;
  createTerm: (kind: WordPressTermKind, name: string) => Promise<WordPressTerm>;
  deleteTerm: (kind: WordPressTermKind, termId: number) => Promise<void>;
  uploadMedia: (file: File) => Promise<WordPressMediaItem>;
  deleteMedia: (mediaId: number) => Promise<void>;
}

export function useWordPressEditorResources(connectionId: string): WordPressEditorResources {
  const [categories, setCategories] = useState<WordPressTerm[]>([]);
  const [tags, setTags] = useState<WordPressTerm[]>([]);
  const [media, setMedia] = useState<WordPressMediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const getAuth = useCallback((): { accessToken: string; workspaceId: string } | null => {
    const accessToken = getStoredAccessToken()?.trim();
    const workspaceId = getStoredActiveWorkspaceId()?.trim();
    if (!accessToken || !workspaceId || !connectionId) return null;
    return { accessToken, workspaceId };
  }, [connectionId]);

  const refresh = useCallback(async (forceRefresh = false): Promise<void> => {
    const auth = getAuth();
    if (!auth) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const [nextCategories, nextTags, nextMedia] = await Promise.all([
        fetchWordPressTerms({ ...auth, connectionId, kind: "categories", forceRefresh }),
        fetchWordPressTerms({ ...auth, connectionId, kind: "tags", forceRefresh }),
        fetchWordPressMedia({ ...auth, connectionId, limit: 30 }),
      ]);
      setCategories(nextCategories);
      setTags(nextTags);
      setMedia(nextMedia);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load WordPress editor data.");
    } finally {
      setLoading(false);
    }
  }, [connectionId, getAuth]);

  useEffect(() => {
    refresh()
      .catch(() => undefined);
  }, [refresh]);

  const createTerm = useCallback(
    async (kind: WordPressTermKind, name: string): Promise<WordPressTerm> => {
      const auth = getAuth();
      if (!auth) {
        throw new Error("Missing workspace session.");
      }
      const term = await createWordPressTerm({ ...auth, connectionId, kind, name });
      if (kind === "categories") {
        setCategories((current) => [term, ...current.filter((row) => row.id !== term.id)]);
      } else {
        setTags((current) => [term, ...current.filter((row) => row.id !== term.id)]);
      }
      return term;
    },
    [connectionId, getAuth],
  );

  const deleteTerm = useCallback(
    async (kind: WordPressTermKind, termId: number): Promise<void> => {
      const auth = getAuth();
      if (!auth) return;
      await deleteWordPressTerm({ ...auth, connectionId, kind, termId });
      if (kind === "categories") {
        setCategories((current) => current.filter((term) => term.id !== termId));
      } else {
        setTags((current) => current.filter((term) => term.id !== termId));
      }
    },
    [connectionId, getAuth],
  );

  const uploadMedia = useCallback(
    async (file: File): Promise<WordPressMediaItem> => {
      const auth = getAuth();
      if (!auth) throw new Error("Missing workspace session.");
      const item = await uploadWordPressMedia({ ...auth, connectionId, file });
      setMedia((current) => [item, ...current]);
      return item;
    },
    [connectionId, getAuth],
  );

  const deleteMedia = useCallback(
    async (mediaId: number): Promise<void> => {
      const auth = getAuth();
      if (!auth) return;
      await deleteWordPressMedia({ ...auth, connectionId, mediaId });
      setMedia((current) => current.filter((item) => item.id !== mediaId));
    },
    [connectionId, getAuth],
  );

  return {
    categories,
    tags,
    media,
    loading,
    error,
    refresh,
    createTerm,
    deleteTerm,
    uploadMedia,
    deleteMedia,
  };
}
