"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import { getStoredAccessToken, getStoredActiveWorkspaceId } from "@/lib/auth/session";
import {
  deleteWordPressPost,
  fetchWordPressPosts,
  updateWordPressPost,
  type WordPressBlogPost,
  type WordPressPostStatus,
  type WordPressPostUpdatePayload,
} from "@/lib/social/wordpressPostsApi";
import { fetchWordPressMedia, type WordPressMediaItem } from "@/lib/social/wordpressMediaApi";
import {
  getWordPressBlogsWorkspaceCache,
  isWordPressBlogsWorkspaceCacheHydrated,
  setWordPressBlogsWorkspaceCache,
} from "@/lib/wordpress/wordpressBlogsWorkspaceCache";

const DEFAULT_STATUSES: WordPressPostStatus[] = [
  "publish",
  "draft",
  "future",
  "pending",
  "private",
];

interface UseWordPressBlogsState {
  posts: WordPressBlogPost[];
  media: WordPressMediaItem[];
  selectedPost: WordPressBlogPost | null;
  selectedPostId: string | null;
  source: string | null;
  loading: boolean;
  refreshing: boolean;
  saving: boolean;
  deleting: boolean;
  error: string | null;
  selectPost: (postId: string) => void;
  refresh: (force?: boolean) => Promise<void>;
  savePost: (payload: WordPressPostUpdatePayload) => Promise<void>;
  deletePost: () => Promise<void>;
}

function getSession(): { accessToken: string; workspaceId: string } {
  const accessToken = getStoredAccessToken()?.trim();
  const workspaceId = getStoredActiveWorkspaceId()?.trim();
  if (!accessToken || !workspaceId) {
    throw new Error("Sign in and select a workspace to manage WordPress blogs.");
  }
  return { accessToken, workspaceId };
}

function postsNeedMediaFetch(posts: WordPressBlogPost[]): boolean {
  return posts.some(
    (post) =>
      Boolean(post.featured_media) &&
      !(post.featured_media_url && post.featured_media_url.trim()),
  );
}

async function loadMediaForPosts(
  accessToken: string,
  workspaceId: string,
  posts: WordPressBlogPost[],
  forceRefresh: boolean,
): Promise<WordPressMediaItem[]> {
  if (!postsNeedMediaFetch(posts)) {
    return [];
  }
  const connectionIds = Array.from(new Set(posts.map((post) => post.connection_id)));
  const connectionId = connectionIds[0];
  if (!connectionId) {
    return [];
  }
  return fetchWordPressMedia({
    accessToken,
    workspaceId,
    connectionId,
    limit: 50,
    forceRefresh,
  });
}

export function useWordPressBlogs(): UseWordPressBlogsState {
  const workspaceId = getStoredActiveWorkspaceId()?.trim() ?? "";
  const cached = workspaceId && isWordPressBlogsWorkspaceCacheHydrated(workspaceId)
    ? getWordPressBlogsWorkspaceCache(workspaceId)
    : null;

  const [posts, setPosts] = useState<WordPressBlogPost[]>(() => [...(cached?.posts ?? [])]);
  const [media, setMedia] = useState<WordPressMediaItem[]>(() => [...(cached?.media ?? [])]);
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);
  const [source, setSource] = useState<string | null>(() => cached?.source ?? null);
  const [loading, setLoading] = useState(!cached);
  const [refreshing, setRefreshing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selectedPost = useMemo(
    () => posts.find((post) => post.id === selectedPostId) ?? posts[0] ?? null,
    [posts, selectedPostId],
  );

  const refresh = useCallback(async (force = false): Promise<void> => {
    const { accessToken, workspaceId: wsId } = getSession();
    setError(null);
    setRefreshing(true);
    try {
      const response = await fetchWordPressPosts({
        accessToken,
        workspaceId: wsId,
        forceRefresh: force,
        limit: 50,
        statuses: DEFAULT_STATUSES,
      });
      const nextPosts = response.posts;
      const nextMedia = await loadMediaForPosts(accessToken, wsId, nextPosts, force);
      setPosts(nextPosts);
      setMedia(nextMedia);
      setSource(response.source);
      setWordPressBlogsWorkspaceCache(wsId, nextPosts, nextMedia, response.source);
      setSelectedPostId((current) => {
        if (current && nextPosts.some((post) => post.id === current)) return current;
        return nextPosts[0]?.id ?? null;
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load WordPress posts.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  const savePost = useCallback(
    async (payload: WordPressPostUpdatePayload): Promise<void> => {
      if (!selectedPost) return;
      const { accessToken, workspaceId: wsId } = getSession();
      setError(null);
      setSaving(true);
      try {
        const updated = await updateWordPressPost({
          accessToken,
          workspaceId: wsId,
          connectionId: selectedPost.connection_id,
          wordpressPostId: selectedPost.wordpress_post_id,
          payload,
        });
        setPosts((current) => {
          const next = current.map((post) => (post.id === selectedPost.id ? updated : post));
          setWordPressBlogsWorkspaceCache(wsId, next, media, source);
          return next;
        });
        setSelectedPostId(updated.id);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Could not update WordPress post.");
      } finally {
        setSaving(false);
      }
    },
    [media, selectedPost, source],
  );

  const deletePost = useCallback(async (): Promise<void> => {
    if (!selectedPost) return;
    const { accessToken, workspaceId: wsId } = getSession();
    setError(null);
    setDeleting(true);
    try {
      await deleteWordPressPost({
        accessToken,
        workspaceId: wsId,
        connectionId: selectedPost.connection_id,
        wordpressPostId: selectedPost.wordpress_post_id,
      });
      setPosts((current) => {
        const next = current.filter((post) => post.id !== selectedPost.id);
        setWordPressBlogsWorkspaceCache(wsId, next, media, source);
        return next;
      });
      setSelectedPostId(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not delete WordPress post.");
    } finally {
      setDeleting(false);
    }
  }, [media, selectedPost, source]);

  useEffect(() => {
    if (workspaceId && isWordPressBlogsWorkspaceCacheHydrated(workspaceId)) {
      return;
    }
    void refresh(false);
  }, [refresh, workspaceId]);

  return {
    posts,
    media,
    selectedPost,
    selectedPostId,
    source,
    loading,
    refreshing,
    saving,
    deleting,
    error,
    selectPost: setSelectedPostId,
    refresh,
    savePost,
    deletePost,
  };
}
