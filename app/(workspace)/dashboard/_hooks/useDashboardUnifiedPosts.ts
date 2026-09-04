"use client";

import { useEffect, useState } from "react";

import { getStoredAccessToken, getStoredActiveWorkspaceId } from "@/lib/auth/session";
import type { DashboardRecentPostView } from "@/lib/dashboard/dashboardRecentPostTypes";
import { fetchDashboardRecentPostCards } from "@/lib/dashboard/unifiedPostsApi";
import { useTranslations } from "@/lib/i18n/WorkspaceLocaleProvider";
import { useContentManagerConnectedChannelLabels } from "@/app/(workspace)/content-manager/_hooks/useContentManagerConnectedChannelLabels";

import { useWorkspaceHeaderAccounts } from "../../_components/WorkspaceHeaderAccountsProvider";
import { useActiveWorkspaceId } from "../../_hooks/useActiveWorkspaceId";

export interface UseDashboardUnifiedPostsResult {
  readonly posts: readonly DashboardRecentPostView[];
  readonly isLoading: boolean;
  readonly error: string | null;
}

export function useDashboardUnifiedPosts(input?: {
  readonly enabled?: boolean;
}): UseDashboardUnifiedPostsResult {
  const enabled = input?.enabled ?? true;
  const activeWorkspaceId = useActiveWorkspaceId();
  const { t } = useTranslations();
  const { selectedAccount, isLoadingProfiles } = useWorkspaceHeaderAccounts();
  const { labelsByFilter } = useContentManagerConnectedChannelLabels();
  const [posts, setPosts] = useState<readonly DashboardRecentPostView[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!enabled) {
      setPosts([]);
      setError(null);
      setIsLoading(false);
      return;
    }
    if (isLoadingProfiles) {
      setPosts([]);
      setError(null);
      setIsLoading(true);
      return;
    }
    if (!selectedAccount) {
      setPosts([]);
      setError(null);
      setIsLoading(false);
      return;
    }
    const token = getStoredAccessToken();
    const workspaceId = getStoredActiveWorkspaceId();
    if (!token || !workspaceId) {
      setPosts([]);
      setError(null);
      setIsLoading(false);
      return;
    }

    const ac = new AbortController();
    setIsLoading(true);
    setError(null);

    void fetchDashboardRecentPostCards(
      token,
      workspaceId,
      selectedAccount,
      labelsByFilter,
      ac.signal,
    )
      .then((next) => {
        if (ac.signal.aborted) {
          return;
        }
        setPosts(next);
      })
      .catch((e: unknown) => {
        if (ac.signal.aborted) {
          return;
        }
        setError(e instanceof Error ? e.message : t("dashboard.loadPostsFailed"));
        setPosts([]);
      })
      .finally(() => {
        if (ac.signal.aborted) {
          return;
        }
        setIsLoading(false);
      });

    return () => {
      ac.abort();
    };
  }, [activeWorkspaceId, enabled, isLoadingProfiles, labelsByFilter, selectedAccount?.id, t]);

  return { posts, isLoading, error };
}
