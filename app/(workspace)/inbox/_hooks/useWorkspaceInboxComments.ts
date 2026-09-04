"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { useWorkspaceHeaderAccounts } from "@/app/(workspace)/_components/WorkspaceHeaderAccountsProvider";
import type { ContentManagerPost } from "@/app/(workspace)/content-manager/_types/contentManagerTypes";
import {
  getStoredAccessToken,
  getStoredActiveWorkspaceId,
} from "@/lib/auth/session";
import { filterUnifiedCommentsResponseForSelectedAccounts } from "@/lib/inbox/filterUnifiedCommentsResponseForSelectedAccounts";
import { fetchInboxMessagesForReplyMessage } from "@/lib/inbox/fetchInboxMessagesForReplyMessage";
import { fetchInboxUnifiedComments } from "@/lib/inbox/fetchInboxUnifiedComments";
import { headerAccountSupportsInboxComments } from "@/lib/inbox/headerAccountSupportsInboxComments";
import {
  contentManagerChannelToCommentsApiPlatform,
  fetchInboxMessagesForContentManagerPost,
} from "@/lib/inbox/inboxCommentsByPost";
import {
  readInboxCommentsWorkspaceCache,
  setInboxCommentsWorkspaceCache,
} from "@/lib/inbox/inboxCommentsWorkspaceCache";
import { mapUnifiedCommentsResponseToInboxMessages } from "@/lib/inbox/mapUnifiedCommentsToInboxMessages";
import type { UnifiedCommentClassificationStatusJson } from "@/lib/inbox/unifiedCommentsTypes";
import {
  filterDeletedCommentFromInboxThread,
  replacePostThreadInInboxMessages,
} from "@/lib/inbox/mergeInboxMessagesById";
import type { UnifiedInboxMessage } from "@/lib/inbox/unifiedInboxTypes";
import type { UnifiedModerateAction } from "@/lib/social/unifiedCommentModerationApi";
import { streamUnifiedCommentClassificationProgress } from "@/lib/social/unifiedCommentsApi";
import { isWorkspaceHeaderAllPlatformsId } from "@/lib/workspace/workspaceHeaderAllPlatforms";
import { useTranslations } from "@/lib/i18n/WorkspaceLocaleProvider";

/** Recent posts to fetch (GET /unified/comments/?limit=…) — initial load and Refresh. */
const UNIFIED_COMMENTS_POST_LIMIT = 50;

function isUnsupportedInboxCommentsMessage(message: string): boolean {
  return /not available for this (channel|account)/i.test(message);
}

export function useWorkspaceInboxComments(input: {
  readonly selectedPostId: string | null;
  readonly selectedPost: ContentManagerPost | null;
}): {
  readonly comments: UnifiedInboxMessage[];
  readonly isLoading: boolean;
  readonly isRefreshing: boolean;
  readonly classificationStatus: UnifiedCommentClassificationStatusJson | null;
  readonly commentsDisabled: boolean;
  readonly commentStatusMessage: string | null;
  readonly channelCommentsUnsupported: boolean;
  readonly error: string | null;
  readonly refresh: () => Promise<void>;
  readonly reloadAfterReply: (
    message: UnifiedInboxMessage,
    action?: UnifiedModerateAction,
  ) => Promise<void>;
  readonly deletingCommentIds: ReadonlySet<string>;
} {
  const { t } = useTranslations();
  const { selectedAccountId, accounts, isLoadingProfiles, isLoadingOAuthStatus } =
    useWorkspaceHeaderAccounts();
  const [allMessages, setAllMessages] = useState<UnifiedInboxMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [deletingCommentIds, setDeletingCommentIds] = useState<ReadonlySet<string>>(
    () => new Set(),
  );
  const [classificationStatus, setClassificationStatus] =
    useState<UnifiedCommentClassificationStatusJson | null>(null);
  const [commentsDisabled, setCommentsDisabled] = useState(false);
  const [commentStatusMessage, setCommentStatusMessage] = useState<string | null>(null);
  const [channelCommentsUnsupported, setChannelCommentsUnsupported] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const requestGenerationRef = useRef(0);
  const classificationFetchGenRef = useRef(0);
  const streamCompletedCountRef = useRef(0);

  const awaitingHeaderAccounts = useMemo((): boolean => {
    if (!selectedAccountId?.trim()) {
      return false;
    }
    if (!isWorkspaceHeaderAllPlatformsId(selectedAccountId)) {
      return false;
    }
    return isLoadingProfiles || isLoadingOAuthStatus;
  }, [isLoadingOAuthStatus, isLoadingProfiles, selectedAccountId]);

  const selectedAccountIds = useMemo((): string[] => {
    if (!selectedAccountId) {
      return [];
    }
    if (isWorkspaceHeaderAllPlatformsId(selectedAccountId)) {
      return accounts
        .map((a) => a.id)
        .filter((id) => !isWorkspaceHeaderAllPlatformsId(id));
    }
    return [selectedAccountId];
  }, [accounts, selectedAccountId]);

  const inboxCommentsSupported = useMemo((): boolean => {
    if (!selectedAccountId?.trim()) {
      return false;
    }
    if (isWorkspaceHeaderAllPlatformsId(selectedAccountId)) {
      return accounts.some(
        (a) =>
          !isWorkspaceHeaderAllPlatformsId(a.id) &&
          headerAccountSupportsInboxComments(a.id),
      );
    }
    return headerAccountSupportsInboxComments(selectedAccountId);
  }, [accounts, selectedAccountId]);

  const markChannelUnsupported = useCallback((): void => {
    setAllMessages([]);
    setCommentsDisabled(true);
    setChannelCommentsUnsupported(true);
    setCommentStatusMessage(t("inbox.commentsUnsupportedBody"));
    setError(null);
  }, [t]);

  const commentsCachePostId = useMemo((): string | null => {
    const post = input.selectedPost;
    if (
      post &&
      input.selectedPostId &&
      post.id === input.selectedPostId &&
      contentManagerChannelToCommentsApiPlatform(post.channel)
    ) {
      return post.id;
    }
    return null;
  }, [input.selectedPost, input.selectedPostId]);

  const applyCachedInboxEntry = useCallback(
    (entry: NonNullable<ReturnType<typeof readInboxCommentsWorkspaceCache>>): void => {
      setAllMessages([...entry.messages]);
      setClassificationStatus(entry.classificationStatus);
      setCommentsDisabled(entry.commentsDisabled);
      setCommentStatusMessage(entry.commentStatusMessage);
      setChannelCommentsUnsupported(entry.channelCommentsUnsupported);
      setError(null);
      setIsLoading(false);
      setIsRefreshing(false);
    },
    [],
  );

  const writeInboxCommentsCache = useCallback(
    (
      messages: readonly UnifiedInboxMessage[],
      meta: {
        classificationStatus: UnifiedCommentClassificationStatusJson | null;
        commentsDisabled: boolean;
        commentStatusMessage: string | null;
        channelCommentsUnsupported: boolean;
      },
    ): void => {
      const ws = getStoredActiveWorkspaceId();
      const accountId = selectedAccountId?.trim();
      if (!ws?.trim() || !accountId) {
        return;
      }
      setInboxCommentsWorkspaceCache(ws, accountId, commentsCachePostId, messages, {
        allowEmpty: true,
        postLimit: UNIFIED_COMMENTS_POST_LIMIT,
        classificationStatus: meta.classificationStatus,
        commentsDisabled: meta.commentsDisabled,
        commentStatusMessage: meta.commentStatusMessage,
        channelCommentsUnsupported: meta.channelCommentsUnsupported,
      });
    },
    [commentsCachePostId, selectedAccountId],
  );

  const loadInitial = useCallback(async (): Promise<void> => {
    const requestGeneration = ++requestGenerationRef.current;
    const isCurrentRequest = (): boolean =>
      requestGeneration === requestGenerationRef.current;

    if (selectedAccountIds.length === 0) {
      setAllMessages([]);
      setError(null);
      if (awaitingHeaderAccounts) {
        setIsLoading(true);
        return;
      }
      setIsLoading(false);
      return;
    }
    if (!inboxCommentsSupported) {
      markChannelUnsupported();
      setIsLoading(false);
      return;
    }

    const token = getStoredAccessToken();
    const ws = getStoredActiveWorkspaceId();
    const accountId = selectedAccountId?.trim();
    if (!token?.trim() || !ws?.trim() || !accountId) {
      setAllMessages([]);
      setError("Sign in and select a workspace to load comments.");
      setIsLoading(false);
      return;
    }

    // Cache-first (same idea as Published Content): revisit Inbox without API.
    const cached = readInboxCommentsWorkspaceCache(
      ws,
      accountId,
      commentsCachePostId,
    );
    if (cached) {
      if (!isCurrentRequest()) {
        return;
      }
      applyCachedInboxEntry(cached);
      return;
    }

    // Cold cache — clear previous scope then fetch.
    setAllMessages([]);
    setCommentsDisabled(false);
    setCommentStatusMessage(null);
    setChannelCommentsUnsupported(false);
    setIsLoading(true);
    setError(null);
    try {
      const post = input.selectedPost;
      if (
        post &&
        input.selectedPostId &&
        post.id === input.selectedPostId &&
        contentManagerChannelToCommentsApiPlatform(post.channel)
      ) {
        const out = await fetchInboxMessagesForContentManagerPost(
          token,
          ws,
          post,
          selectedAccountId,
          false,
        );
        if (!isCurrentRequest()) {
          return;
        }
        setClassificationStatus(out.classificationStatus);
        setCommentsDisabled(out.commentsDisabled);
        setCommentStatusMessage(out.commentStatusMessage);
        setAllMessages(out.messages);
        writeInboxCommentsCache(out.messages, {
          classificationStatus: out.classificationStatus,
          commentsDisabled: out.commentsDisabled,
          commentStatusMessage: out.commentStatusMessage,
          channelCommentsUnsupported: false,
        });
        return;
      }

      const data = await fetchInboxUnifiedComments(
        token,
        ws,
        selectedAccountIds,
        {
          forceRefresh: false,
          postLimit: UNIFIED_COMMENTS_POST_LIMIT,
        },
      );
      if (!isCurrentRequest()) {
        return;
      }
      if (!data.success) {
        setAllMessages([]);
        const message = data.message ?? "Could not load comments.";
        if (isUnsupportedInboxCommentsMessage(message)) {
          markChannelUnsupported();
        } else {
          setCommentsDisabled(false);
          setChannelCommentsUnsupported(false);
          setCommentStatusMessage(null);
          setError(message);
        }
        return;
      }
      const scoped = filterUnifiedCommentsResponseForSelectedAccounts(
        data,
        selectedAccountIds,
      );
      const mapped = mapUnifiedCommentsResponseToInboxMessages(scoped);
      const classification = scoped.classification_status ?? null;
      setClassificationStatus(classification);
      setCommentsDisabled(false);
      setChannelCommentsUnsupported(false);
      setCommentStatusMessage(null);
      setAllMessages(mapped);
      writeInboxCommentsCache(mapped, {
        classificationStatus: classification,
        commentsDisabled: false,
        commentStatusMessage: null,
        channelCommentsUnsupported: false,
      });
    } catch (e) {
      if (!isCurrentRequest()) {
        return;
      }
      setAllMessages([]);
      setError(e instanceof Error ? e.message : "Could not load comments.");
    } finally {
      setIsLoading(false);
    }
  }, [
    applyCachedInboxEntry,
    awaitingHeaderAccounts,
    commentsCachePostId,
    inboxCommentsSupported,
    input.selectedPost,
    input.selectedPostId,
    markChannelUnsupported,
    selectedAccountId,
    selectedAccountIds,
    writeInboxCommentsCache,
  ]);

  const refresh = useCallback(async (): Promise<void> => {
    if (selectedAccountIds.length === 0) {
      return;
    }
    if (!inboxCommentsSupported) {
      markChannelUnsupported();
      return;
    }
    const requestGeneration = ++requestGenerationRef.current;
    const isCurrentRequest = (): boolean =>
      requestGeneration === requestGenerationRef.current;
    setIsRefreshing(true);
    setIsLoading(false);
    setError(null);
    try {
      const token = getStoredAccessToken();
      const ws = getStoredActiveWorkspaceId();
      if (!token?.trim() || !ws?.trim()) {
        setError("Sign in and select a workspace to load comments.");
        return;
      }

      const post = input.selectedPost;
      if (
        post &&
        input.selectedPostId &&
        post.id === input.selectedPostId &&
        contentManagerChannelToCommentsApiPlatform(post.channel)
      ) {
        const out = await fetchInboxMessagesForContentManagerPost(
          token,
          ws,
          post,
          selectedAccountId,
          true,
        );
        if (!isCurrentRequest()) {
          return;
        }
        setClassificationStatus(out.classificationStatus);
        setCommentsDisabled(out.commentsDisabled);
        setCommentStatusMessage(out.commentStatusMessage);
        setAllMessages((prev) => {
          const next = replacePostThreadInInboxMessages(prev, post.id, out.messages);
          writeInboxCommentsCache(next, {
            classificationStatus: out.classificationStatus,
            commentsDisabled: out.commentsDisabled,
            commentStatusMessage: out.commentStatusMessage,
            channelCommentsUnsupported: false,
          });
          return next;
        });
        return;
      }

      const data = await fetchInboxUnifiedComments(token, ws, selectedAccountIds, {
        forceRefresh: true,
        postLimit: UNIFIED_COMMENTS_POST_LIMIT,
      });
      if (!isCurrentRequest()) {
        return;
      }
      if (!data.success) {
        const message = data.message ?? "Could not load comments.";
        if (isUnsupportedInboxCommentsMessage(message)) {
          markChannelUnsupported();
        } else {
          setCommentsDisabled(false);
          setChannelCommentsUnsupported(false);
          setCommentStatusMessage(null);
          setError(message);
        }
        return;
      }
      const scoped = filterUnifiedCommentsResponseForSelectedAccounts(
        data,
        selectedAccountIds,
      );
      const classification = scoped.classification_status ?? null;
      const mapped = mapUnifiedCommentsResponseToInboxMessages(scoped);
      setClassificationStatus(classification);
      setCommentsDisabled(false);
      setChannelCommentsUnsupported(false);
      setCommentStatusMessage(null);
      setAllMessages(mapped);
      writeInboxCommentsCache(mapped, {
        classificationStatus: classification,
        commentsDisabled: false,
        commentStatusMessage: null,
        channelCommentsUnsupported: false,
      });
    } catch (e) {
      if (!isCurrentRequest()) {
        return;
      }
      setError(e instanceof Error ? e.message : "Could not load comments.");
    } finally {
      setIsRefreshing(false);
    }
  }, [
    input.selectedPost,
    input.selectedPostId,
    inboxCommentsSupported,
    markChannelUnsupported,
    selectedAccountId,
    selectedAccountIds,
    writeInboxCommentsCache,
  ]);

  const refreshClassificationComments = useCallback(async (): Promise<void> => {
    if (selectedAccountIds.length === 0 || !inboxCommentsSupported) {
      return;
    }
    const requestGeneration = ++classificationFetchGenRef.current;
    const isCurrentRequest = (): boolean =>
      requestGeneration === classificationFetchGenRef.current;
    try {
      const token = getStoredAccessToken();
      const ws = getStoredActiveWorkspaceId();
      if (!token?.trim() || !ws?.trim()) {
        return;
      }

      const post = input.selectedPost;
      if (
        post &&
        input.selectedPostId &&
        post.id === input.selectedPostId &&
        contentManagerChannelToCommentsApiPlatform(post.channel)
      ) {
        const out = await fetchInboxMessagesForContentManagerPost(
          token,
          ws,
          post,
          selectedAccountId,
          false,
        );
        if (!isCurrentRequest()) {
          return;
        }
        setClassificationStatus(out.classificationStatus);
        setCommentsDisabled(out.commentsDisabled);
        setCommentStatusMessage(out.commentStatusMessage);
        setAllMessages((prev) => {
          const next = replacePostThreadInInboxMessages(prev, post.id, out.messages);
          writeInboxCommentsCache(next, {
            classificationStatus: out.classificationStatus,
            commentsDisabled: out.commentsDisabled,
            commentStatusMessage: out.commentStatusMessage,
            channelCommentsUnsupported: false,
          });
          return next;
        });
        return;
      }

      const data = await fetchInboxUnifiedComments(token, ws, selectedAccountIds, {
        forceRefresh: false,
        postLimit: UNIFIED_COMMENTS_POST_LIMIT,
      });
      if (!isCurrentRequest() || !data.success) {
        return;
      }
      const scoped = filterUnifiedCommentsResponseForSelectedAccounts(
        data,
        selectedAccountIds,
      );
      const classification = scoped.classification_status ?? null;
      const mapped = mapUnifiedCommentsResponseToInboxMessages(scoped);
      setClassificationStatus(classification);
      setAllMessages(mapped);
      writeInboxCommentsCache(mapped, {
        classificationStatus: classification,
        commentsDisabled: false,
        commentStatusMessage: null,
        channelCommentsUnsupported: false,
      });
    } catch {
      // Background categorization progress should never interrupt reading comments.
    }
  }, [
    input.selectedPost,
    input.selectedPostId,
    inboxCommentsSupported,
    selectedAccountId,
    selectedAccountIds,
    writeInboxCommentsCache,
  ]);

  const reloadAfterReply = useCallback(
    async (
      message: UnifiedInboxMessage,
      action?: UnifiedModerateAction,
    ): Promise<void> => {
      const requestGeneration = ++requestGenerationRef.current;
      const isCurrentRequest = (): boolean =>
        requestGeneration === requestGenerationRef.current;
      const token = getStoredAccessToken();
      const ws = getStoredActiveWorkspaceId();
      if (!token?.trim() || !ws?.trim()) {
        return;
      }
      const isDelete = action === "delete";
      if (isDelete) {
        setDeletingCommentIds((prev) => {
          const next = new Set(prev);
          next.add(message.id);
          return next;
        });
      } else {
        // Optimistically mark as replied so the counter drops immediately
        setAllMessages((prev) =>
          prev.map((m) =>
            m.id === message.id ? { ...m, unreplied: false } : m,
          ),
        );
      }
      setIsRefreshing(true);
      setError(null);
      try {
        const rows = await fetchInboxMessagesForReplyMessage(
          token,
          ws,
          message,
          true,
        );
        if (!isCurrentRequest()) {
          return;
        }
        const pid = message.sourcePostId?.trim() ?? "";
        if (pid.length === 0) {
          return;
        }
        const threadRows = isDelete
          ? filterDeletedCommentFromInboxThread(rows, message)
          : rows;
        setAllMessages((prev) => {
          const next = replacePostThreadInInboxMessages(prev, pid, threadRows);
          const accountId = selectedAccountId?.trim();
          const workspaceId = getStoredActiveWorkspaceId();
          if (workspaceId?.trim() && accountId) {
            // Only write the active cache scope — never poison account-wide with a single-post list.
            setInboxCommentsWorkspaceCache(
              workspaceId,
              accountId,
              commentsCachePostId,
              next,
              { allowEmpty: true, postLimit: UNIFIED_COMMENTS_POST_LIMIT },
            );
          }
          return next;
        });
      } catch (e) {
        if (!isCurrentRequest()) {
          return;
        }
        setError(
          e instanceof Error ? e.message : "Could not refresh this thread.",
        );
      } finally {
        if (isDelete) {
          setDeletingCommentIds((prev) => {
            const next = new Set(prev);
            next.delete(message.id);
            return next;
          });
        }
        setIsRefreshing(false);
      }
    },
    [commentsCachePostId, selectedAccountId],
  );

  useEffect(() => {
    // Invalidate in-flight work before the new selection's load effect runs.
    requestGenerationRef.current += 1;
    setError(null);
    setIsRefreshing(false);
    const ws = getStoredActiveWorkspaceId();
    const accountId = selectedAccountId?.trim() ?? "";
    const cached =
      ws?.trim() && accountId
        ? readInboxCommentsWorkspaceCache(ws, accountId, commentsCachePostId)
        : null;
    if (cached) {
      applyCachedInboxEntry(cached);
      return;
    }
    setAllMessages([]);
    setClassificationStatus(null);
    setIsLoading(true);
  }, [applyCachedInboxEntry, commentsCachePostId, selectedAccountId]);

  useEffect(
    () => () => {
      requestGenerationRef.current += 1;
    },
    [],
  );

  useEffect(() => {
    void loadInitial();
  }, [loadInitial]);

  useEffect(() => {
    if (classificationStatus?.state !== "running") {
      return;
    }
    const token = getStoredAccessToken();
    const ws = getStoredActiveWorkspaceId();
    if (!token?.trim() || !ws?.trim()) {
      return;
    }
    const controller = new AbortController();
    streamCompletedCountRef.current = 0;
    void streamUnifiedCommentClassificationProgress(token, ws, {
      signal: controller.signal,
      onProgress: (event) => {
        setClassificationStatus((current) => ({
          ...current,
          state: event.state ?? current?.state ?? "running",
          pending_count: event.pending_count ?? current?.pending_count ?? 0,
          total_count: event.total_count ?? current?.total_count ?? null,
          completed_count:
            event.completed_count ?? current?.completed_count ?? null,
          estimated_seconds: current?.estimated_seconds ?? 0,
        }));
        const completed = Math.max(0, event.completed_count ?? 0);
        if (completed > streamCompletedCountRef.current) {
          streamCompletedCountRef.current = completed;
          void refreshClassificationComments();
        }
      },
    }).catch((e: unknown) => {
      if (!controller.signal.aborted) {
        setClassificationStatus(null);
        setError(
          e instanceof Error
            ? e.message
            : "Could not stream comment categorization progress.",
        );
      }
    });
    return () => {
      controller.abort();
    };
  }, [
    classificationStatus?.state,
    refreshClassificationComments,
  ]);

  // Keep cached/previous messages visible while accounts or refresh hydrate.
  const commentsPending =
    allMessages.length === 0 &&
    (isLoading || awaitingHeaderAccounts);

  return {
    comments: allMessages,
    isLoading: commentsPending,
    isRefreshing,
    classificationStatus,
    commentsDisabled,
    commentStatusMessage,
    channelCommentsUnsupported,
    error,
    refresh,
    reloadAfterReply,
    deletingCommentIds,
  };
}
