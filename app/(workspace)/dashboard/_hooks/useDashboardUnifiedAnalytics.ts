"use client";

import { useEffect, useState } from "react";

import { getStoredAccessToken, getStoredActiveWorkspaceId } from "@/lib/auth/session";
import type { UnifiedAnalyticsPlatformSlice } from "@/lib/dashboard/unifiedAnalyticsTypes";
import { fetchAnalyticsSliceForHeaderAccount } from "@/lib/dashboard/unifiedAnalyticsApi";

import { useWorkspaceHeaderAccounts } from "../../_components/WorkspaceHeaderAccountsProvider";
import { useActiveWorkspaceId } from "../../_hooks/useActiveWorkspaceId";

export interface UseDashboardUnifiedAnalyticsResult {
  readonly slice: UnifiedAnalyticsPlatformSlice | null;
  readonly isLoading: boolean;
  readonly error: string | null;
}

export function useDashboardUnifiedAnalytics(input?: {
  readonly enabled?: boolean;
}): UseDashboardUnifiedAnalyticsResult {
  const enabled = input?.enabled ?? true;
  const activeWorkspaceId = useActiveWorkspaceId();
  const { selectedAccount, isLoadingProfiles } = useWorkspaceHeaderAccounts();
  const [slice, setSlice] = useState<UnifiedAnalyticsPlatformSlice | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!enabled) {
      setSlice(null);
      setError(null);
      setIsLoading(false);
      return;
    }
    if (isLoadingProfiles) {
      setSlice(null);
      setError(null);
      setIsLoading(true);
      return;
    }
    if (!selectedAccount) {
      setSlice(null);
      setError(null);
      setIsLoading(false);
      return;
    }
    const token = getStoredAccessToken();
    const workspaceId = getStoredActiveWorkspaceId();
    if (!token || !workspaceId) {
      setSlice(null);
      setError(null);
      setIsLoading(false);
      return;
    }

    const ac = new AbortController();
    setIsLoading(true);
    setError(null);

    void fetchAnalyticsSliceForHeaderAccount(
      token,
      workspaceId,
      selectedAccount,
      ac.signal,
    )
      .then((next) => {
        if (ac.signal.aborted) {
          return;
        }
        setSlice(next);
      })
      .catch((e: unknown) => {
        if (ac.signal.aborted) {
          return;
        }
        setError(e instanceof Error ? e.message : "Failed to load analytics");
        setSlice(null);
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
  }, [activeWorkspaceId, enabled, isLoadingProfiles, selectedAccount?.id]);

  return { slice, isLoading, error };
}
