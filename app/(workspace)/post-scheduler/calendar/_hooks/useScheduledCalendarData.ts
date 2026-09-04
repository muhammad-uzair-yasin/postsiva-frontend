"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";

import { headerAccountRowToUnifiedScheduledPostsQuery } from "@/app/(workspace)/content-manager/_utils/headerAccountRowToUnifiedScheduledPostsQuery";
import { useContentManagerConnectedChannelLabels } from "@/app/(workspace)/content-manager/_hooks/useContentManagerConnectedChannelLabels";
import { getStoredAccessToken, getStoredActiveWorkspaceId } from "@/lib/auth/session";
import { CONTENT_MANAGER_SCHEDULED_REFRESH_EVENT } from "@/lib/contentManager/contentManagerScheduledRefresh";
import {
  ensurePublishedPostsForSelectedAccount,
  ensureScheduledPostsForSelectedAccount,
} from "@/lib/contentManager/ensureSelectedAccountPostsHydrated";
import {
  getPublishedPostsWorkspaceCache,
  getPublishedPostsWorkspaceCacheVersion,
  subscribePublishedPostsWorkspaceCache,
} from "@/lib/contentManager/publishedPostsWorkspaceCache";
import { refreshPublishedPostsForInbox } from "@/lib/inbox/refreshPublishedPostsForInbox";
import {
  getScheduledPostsWorkspaceCache,
  getScheduledPostsWorkspaceCacheVersion,
  setScheduledPostsWorkspaceCache,
  subscribeScheduledPostsWorkspaceCache,
} from "@/lib/contentManager/scheduledPostsWorkspaceCache";
import { useTranslations } from "@/lib/i18n/WorkspaceLocaleProvider";
import { isWordPressUnifiedPlatform } from "@/lib/social/unifiedBlogPlatform";
import { fetchAllActiveWorkspaceScheduledPosts } from "@/lib/social/fetchWorkspaceScheduledPosts";
import { rescheduleWorkspaceScheduledPostById } from "@/lib/social/workspaceScheduledPostMutations";
import { isWorkspaceHeaderAllPlatformsId } from "@/lib/workspace/workspaceHeaderAllPlatforms";

import { useWorkspaceHeaderAccounts } from "../../../_components/WorkspaceHeaderAccountsProvider";
import type { CalendarPost } from "../_types/calendarTypes";
import { calendarScheduledRowsEquivalent } from "../_types/calendarTypes";
import { normalizeScheduledPost } from "../_utils/calendarData";
import { mapContentManagerPostToCalendarPost } from "../_utils/mapContentManagerPostToCalendarPost";

/** List-mode calendar: selected-platform published + social scheduled (cache-first). */
export function useScheduledCalendarData(enabled: boolean) {
  const { t } = useTranslations();
  const { selectedAccount, isLoadingProfiles, unifiedProfiles } = useWorkspaceHeaderAccounts();
  const { labelsByFilter } = useContentManagerConnectedChannelLabels();
  const publishedCacheVersion = useSyncExternalStore(
    subscribePublishedPostsWorkspaceCache,
    getPublishedPostsWorkspaceCacheVersion,
    getPublishedPostsWorkspaceCacheVersion,
  );
  const scheduledCacheVersion = useSyncExternalStore(
    subscribeScheduledPostsWorkspaceCache,
    getScheduledPostsWorkspaceCacheVersion,
    getScheduledPostsWorkspaceCacheVersion,
  );

  const [scheduledPosts, setScheduledPosts] = useState<CalendarPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [savingIds, setSavingIds] = useState<Set<string>>(new Set());
  const publishedInFlightRef = useRef<string | null>(null);

  const accountId = selectedAccount?.id ?? null;
  const workspaceId = getStoredActiveWorkspaceId();

  useEffect(() => {
    if (!enabled || isLoadingProfiles || !selectedAccount || selectedAccount.disabled) {
      return;
    }
    const token = getStoredAccessToken();
    const workspace = getStoredActiveWorkspaceId();
    if (!token || !workspace) return;
    void ensurePublishedPostsForSelectedAccount({
      accessToken: token,
      workspaceId: workspace,
      selectedAccount,
      labels: labelsByFilter,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps -- account id settle only
  }, [enabled, isLoadingProfiles, selectedAccount?.id]);

  const publishedCalendarPosts = useMemo((): CalendarPost[] => {
    void publishedCacheVersion;
    if (!enabled || !workspaceId?.trim() || !accountId?.trim()) {
      return [];
    }
    const cached = getPublishedPostsWorkspaceCache(workspaceId, accountId) ?? [];
    return cached
      .map(mapContentManagerPostToCalendarPost)
      .filter((post): post is CalendarPost => post !== null);
  }, [accountId, enabled, publishedCacheVersion, workspaceId]);

  const applyScheduledRows = useCallback((rows: Parameters<typeof normalizeScheduledPost>[0][]) => {
    const now = Date.now();
    const next = rows
      .map(normalizeScheduledPost)
      .filter(
        (post): post is CalendarPost =>
          post !== null &&
          (post.postKind === "failed" || post.scheduledAt.getTime() >= now),
      );
    setScheduledPosts((prev) => {
      if (
        prev.length === next.length &&
        prev.every((p, i) => calendarScheduledRowsEquivalent(p, next[i]!))
      ) {
        return prev;
      }
      return next;
    });
  }, []);

  const loadScheduled = useCallback(
    async (opts?: { force?: boolean }) => {
      if (!enabled) {
        return;
      }
      const token = getStoredAccessToken();
      const workspace = getStoredActiveWorkspaceId();
      if (!token || !workspace || !selectedAccount || selectedAccount.disabled) {
        setError(t("postScheduler.calendar.signInRequired"));
        setLoading(false);
        setScheduledPosts([]);
        return;
      }

      const force = opts?.force === true;
      if (!force) {
        const cached = getScheduledPostsWorkspaceCache(workspace, selectedAccount.id);
        if (cached) {
          applyScheduledRows(cached);
          setLoading(false);
          setError(null);
          return;
        }
        setLoading(true);
        setError(null);
        try {
          await ensureScheduledPostsForSelectedAccount({
            accessToken: token,
            workspaceId: workspace,
            selectedAccount,
            unifiedProfiles,
          });
          applyScheduledRows(
            getScheduledPostsWorkspaceCache(workspace, selectedAccount.id) ?? [],
          );
        } catch (reason) {
          setError(
            reason instanceof Error ? reason.message : t("postScheduler.calendar.loadFailed"),
          );
          setScheduledPosts([]);
        } finally {
          setLoading(false);
        }
        return;
      }

      setLoading(true);
      setError(null);
      try {
        const allPlatforms = isWorkspaceHeaderAllPlatformsId(selectedAccount.id);
        const scheduledQuery = headerAccountRowToUnifiedScheduledPostsQuery({
          row: selectedAccount,
          unifiedProfiles,
        });
        const platform = allPlatforms ? null : scheduledQuery.platform;

        if (isWordPressUnifiedPlatform(platform)) {
          setScheduledPostsWorkspaceCache(workspace, selectedAccount.id, []);
          setScheduledPosts([]);
          return;
        }

        const all = await fetchAllActiveWorkspaceScheduledPosts(token, workspace, {
          platform,
          platformUserId: allPlatforms ? null : scheduledQuery.platformUserId,
          includeBlog: false,
        });
        setScheduledPostsWorkspaceCache(workspace, selectedAccount.id, all);
        applyScheduledRows(all);
      } catch (reason) {
        setError(reason instanceof Error ? reason.message : t("postScheduler.calendar.loadFailed"));
        setScheduledPosts([]);
      } finally {
        setLoading(false);
      }
    },
    [applyScheduledRows, enabled, selectedAccount, t, unifiedProfiles],
  );

  useEffect(() => {
    if (!enabled || isLoadingProfiles) {
      return;
    }
    void loadScheduled();
  }, [enabled, isLoadingProfiles, loadScheduled, scheduledCacheVersion, selectedAccount?.id]);

  useEffect(() => {
    if (!enabled) return;
    const onRefresh = (): void => {
      void loadScheduled({ force: true });
    };
    window.addEventListener(CONTENT_MANAGER_SCHEDULED_REFRESH_EVENT, onRefresh);
    return () => window.removeEventListener(CONTENT_MANAGER_SCHEDULED_REFRESH_EVENT, onRefresh);
  }, [enabled, loadScheduled]);

  const posts = useMemo(() => {
    return [...publishedCalendarPosts, ...scheduledPosts].sort(
      (a, b) => a.scheduledAt.getTime() - b.scheduledAt.getTime(),
    );
  }, [publishedCalendarPosts, scheduledPosts]);

  const refreshPublishedLive = useCallback(async (): Promise<void> => {
    if (!selectedAccount || selectedAccount.disabled) return;
    const token = getStoredAccessToken();
    const workspace = getStoredActiveWorkspaceId();
    if (!token || !workspace) return;
    const flightKey = `${workspace}\0${selectedAccount.id}\0live`;
    if (publishedInFlightRef.current === flightKey) return;
    publishedInFlightRef.current = flightKey;
    try {
      await refreshPublishedPostsForInbox({
        accessToken: token,
        workspaceId: workspace,
        accountId: selectedAccount.id,
        selectedAccount,
        labels: labelsByFilter,
        forceRefresh: true,
      });
    } finally {
      if (publishedInFlightRef.current === flightKey) {
        publishedInFlightRef.current = null;
      }
    }
  }, [labelsByFilter, selectedAccount]);

  const reschedule = useCallback(async (id: string, target: Date) => {
    if (savingIds.has(id)) throw new Error(t("postScheduler.calendar.alreadySaving"));
    if (target.getTime() <= Date.now()) throw new Error(t("postScheduler.calendar.chooseFuture"));
    const token = getStoredAccessToken();
    const workspace = getStoredActiveWorkspaceId();
    if (!token || !workspace) throw new Error(t("postScheduler.calendar.notSignedIn"));
    const calendarPost = scheduledPosts.find((post) => post.id === id);
    const previous = calendarPost?.scheduledAt;
    const platform = calendarPost?.platform;
    setSavingIds((current) => new Set(current).add(id));
    setScheduledPosts((items) =>
      items.map((post) => (post.id === id ? { ...post, scheduledAt: target } : post)),
    );
    try {
      const result = await rescheduleWorkspaceScheduledPostById(
        token,
        workspace,
        id,
        platform,
        target.toISOString(),
      );
      if (!result.success) throw new Error(result.error || result.message);
      await loadScheduled({ force: true });
    } catch (reason) {
      if (previous) {
        setScheduledPosts((items) =>
          items.map((post) => (post.id === id ? { ...post, scheduledAt: previous } : post)),
        );
      }
      await loadScheduled({ force: true });
      throw reason;
    } finally {
      setSavingIds((current) => {
        const next = new Set(current);
        next.delete(id);
        return next;
      });
    }
  }, [loadScheduled, scheduledPosts, savingIds, t]);

  return {
    posts,
    loading: isLoadingProfiles || loading,
    error,
    refresh: () => loadScheduled({ force: true }),
    refreshScheduledOnly: () => loadScheduled({ force: true }),
    refreshPublishedLive,
    reschedule,
    savingIds,
  };
}
