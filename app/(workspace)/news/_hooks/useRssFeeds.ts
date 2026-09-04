"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { getStoredAccessToken } from "@/lib/auth/session";
import type { ArticleItem } from "@/lib/news/newsApi";
import {
  createRssFeed,
  deleteRssFeed,
  fetchRssArticles,
  listRssFeeds,
  type RssFeedDto,
} from "@/lib/news/rssFeedsApi";
import { useActiveWorkspaceId } from "../../_hooks/useActiveWorkspaceId";

export interface RssFeed {
  id: string;
  name: string;
  url: string;
  includeKeywords: string[];
  excludeKeywords: string[];
  usedInPosts: boolean;
  createdAt: string;
  lastError: string | null;
}

export interface AddRssFeedInput {
  name: string;
  url: string;
  includeKeywords: string[];
  excludeKeywords: string[];
}

interface UseRssFeedsResult {
  feeds: RssFeed[];
  articles: ArticleItem[];
  articleTotal: number;
  hasMoreArticles: boolean;
  search: string;
  feedFilterId: string | "all";
  isAddOpen: boolean;
  isAvailableOpen: boolean;
  isLoadingFeeds: boolean;
  isLoadingArticles: boolean;
  isLoadingMoreArticles: boolean;
  isAdding: boolean;
  feedsError: string | null;
  articlesError: string | null;
  addError: string | null;
  setSearch: (value: string) => void;
  setFeedFilterId: (id: string | "all") => void;
  openAdd: () => void;
  closeAdd: () => void;
  openAvailable: () => void;
  closeAvailable: () => void;
  addFeed: (input: AddRssFeedInput) => Promise<void>;
  removeFeed: (id: string) => Promise<void>;
  loadMoreArticles: () => void;
  refresh: () => void;
}

function mapFeed(dto: RssFeedDto): RssFeed {
  return {
    id: dto.id,
    name: dto.name,
    url: dto.url,
    includeKeywords: dto.include_keywords ?? [],
    excludeKeywords: dto.exclude_keywords ?? [],
    usedInPosts: false,
    createdAt: dto.created_at,
    lastError: dto.last_error,
  };
}

function toArticleItem(
  row: {
    title: string;
    url: string;
    image: string | null;
    source: string | null;
    published_at: string | null;
    snippet: string | null;
  },
): ArticleItem {
  return {
    title: row.title,
    url: row.url,
    image: row.image,
    source: row.source,
    published_at: row.published_at,
    snippet: row.snippet,
    source_type: "rss",
  };
}

export function useRssFeeds(): UseRssFeedsResult {
  const workspaceId = useActiveWorkspaceId();
  const [feeds, setFeeds] = useState<RssFeed[]>([]);
  const [articles, setArticles] = useState<ArticleItem[]>([]);
  const [articleTotal, setArticleTotal] = useState(0);
  const [articlePage, setArticlePage] = useState(1);
  const [hasMoreArticles, setHasMoreArticles] = useState(false);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [feedFilterId, setFeedFilterId] = useState<string | "all">("all");
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isAvailableOpen, setIsAvailableOpen] = useState(false);
  const [isLoadingFeeds, setIsLoadingFeeds] = useState(false);
  const [isLoadingArticles, setIsLoadingArticles] = useState(false);
  const [isLoadingMoreArticles, setIsLoadingMoreArticles] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [feedsError, setFeedsError] = useState<string | null>(null);
  const [articlesError, setArticlesError] = useState<string | null>(null);
  const [addError, setAddError] = useState<string | null>(null);
  const articleKeyRef = useRef(0);

  useEffect(() => {
    const t = window.setTimeout(() => setDebouncedSearch(search.trim()), 300);
    return () => window.clearTimeout(t);
  }, [search]);

  const refreshFeeds = useCallback(async () => {
    const token = getStoredAccessToken();
    if (!token || !workspaceId) {
      setFeeds([]);
      return;
    }
    setIsLoadingFeeds(true);
    setFeedsError(null);
    try {
      const data = await listRssFeeds(token, workspaceId);
      setFeeds(data.items.map(mapFeed));
    } catch (e) {
      setFeedsError(e instanceof Error ? e.message : "Failed to load feeds");
    } finally {
      setIsLoadingFeeds(false);
    }
  }, [workspaceId]);

  const fetchArticlesPage = useCallback(
    async (pageNum: number, append: boolean, bypassCache = false) => {
      const token = getStoredAccessToken();
      if (!token || !workspaceId) {
        setArticles([]);
        setArticleTotal(0);
        setHasMoreArticles(false);
        return;
      }

      const key = ++articleKeyRef.current;
      if (append) setIsLoadingMoreArticles(true);
      else {
        setIsLoadingArticles(true);
        setArticlesError(null);
      }

      try {
        const data = await fetchRssArticles(token, workspaceId, {
          page: pageNum,
          feedId: feedFilterId === "all" ? undefined : feedFilterId,
          q: debouncedSearch || undefined,
          refresh: bypassCache || undefined,
        });
        if (key !== articleKeyRef.current) return;
        const mapped = data.articles.map(toArticleItem);
        setArticles((prev) => (append ? [...prev, ...mapped] : mapped));
        setArticleTotal(data.meta.total);
        setArticlePage(data.meta.page);
        setHasMoreArticles(data.meta.has_more);
      } catch (e) {
        if (key !== articleKeyRef.current) return;
        setArticlesError(e instanceof Error ? e.message : "Failed to load articles");
        if (!append) {
          setArticles([]);
          setArticleTotal(0);
          setHasMoreArticles(false);
        }
      } finally {
        if (key === articleKeyRef.current) {
          setIsLoadingArticles(false);
          setIsLoadingMoreArticles(false);
        }
      }
    },
    [workspaceId, feedFilterId, debouncedSearch],
  );

  useEffect(() => {
    void refreshFeeds();
  }, [refreshFeeds]);

  useEffect(() => {
    setArticlePage(1);
    void fetchArticlesPage(1, false);
  }, [fetchArticlesPage]);

  const addFeed = useCallback(
    async (input: AddRssFeedInput) => {
      const token = getStoredAccessToken();
      if (!token || !workspaceId) {
        throw new Error("Select a workspace and sign in to add feeds");
      }
      setIsAdding(true);
      setAddError(null);
      try {
        const dto = await createRssFeed(token, workspaceId, {
          name: input.name.trim(),
          url: input.url.trim(),
          include_keywords: input.includeKeywords,
          exclude_keywords: input.excludeKeywords,
        });
        setFeeds((prev) => [mapFeed(dto), ...prev.filter((f) => f.id !== dto.id)]);
        setIsAddOpen(false);
        setArticlePage(1);
        void fetchArticlesPage(1, false);
      } catch (e) {
        const msg = e instanceof Error ? e.message : "Failed to add feed";
        setAddError(msg);
        throw e;
      } finally {
        setIsAdding(false);
      }
    },
    [workspaceId, fetchArticlesPage],
  );

  const removeFeed = useCallback(
    async (id: string) => {
      const token = getStoredAccessToken();
      if (!token || !workspaceId) return;
      await deleteRssFeed(token, workspaceId, id);
      setFeeds((prev) => prev.filter((f) => f.id !== id));
      const nextFilter = feedFilterId === id ? "all" : feedFilterId;
      if (nextFilter !== feedFilterId) setFeedFilterId(nextFilter);
      // Always refetch; if filter was this feed, load all (don't wait for state)
      const key = ++articleKeyRef.current;
      setIsLoadingArticles(true);
      setArticlesError(null);
      try {
        const data = await fetchRssArticles(token, workspaceId, {
          page: 1,
          feedId: nextFilter === "all" ? undefined : nextFilter,
          q: debouncedSearch || undefined,
        });
        if (key !== articleKeyRef.current) return;
        setArticles(data.articles.map(toArticleItem));
        setArticleTotal(data.meta.total);
        setArticlePage(data.meta.page);
        setHasMoreArticles(data.meta.has_more);
      } catch (e) {
        if (key !== articleKeyRef.current) return;
        setArticlesError(e instanceof Error ? e.message : "Failed to load articles");
        setArticles([]);
        setArticleTotal(0);
        setHasMoreArticles(false);
      } finally {
        if (key === articleKeyRef.current) setIsLoadingArticles(false);
      }
    },
    [workspaceId, feedFilterId, debouncedSearch],
  );

  const loadMoreArticles = useCallback(() => {
    if (hasMoreArticles && !isLoadingMoreArticles) {
      void fetchArticlesPage(articlePage + 1, true);
    }
  }, [hasMoreArticles, isLoadingMoreArticles, fetchArticlesPage, articlePage]);

  const refresh = useCallback(() => {
    void refreshFeeds();
    setArticlePage(1);
    void fetchArticlesPage(1, false, true);
  }, [refreshFeeds, fetchArticlesPage]);

  return {
    feeds,
    articles,
    articleTotal,
    hasMoreArticles,
    search,
    feedFilterId,
    isAddOpen,
    isAvailableOpen,
    isLoadingFeeds,
    isLoadingArticles,
    isLoadingMoreArticles,
    isAdding,
    feedsError,
    articlesError,
    addError,
    setSearch,
    setFeedFilterId,
    openAdd: () => {
      setAddError(null);
      setIsAddOpen(true);
    },
    closeAdd: () => {
      setIsAddOpen(false);
      setAddError(null);
    },
    openAvailable: () => {
      setAddError(null);
      setIsAvailableOpen(true);
    },
    closeAvailable: () => {
      setIsAvailableOpen(false);
      setAddError(null);
    },
    addFeed,
    removeFeed,
    loadMoreArticles,
    refresh,
  };
}
