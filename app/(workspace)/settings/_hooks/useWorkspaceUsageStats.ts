"use client";

import { useCallback, useEffect, useState } from "react";

import { getStoredAccessToken, getStoredActiveWorkspaceId } from "@/lib/auth/session";
import {
  fetchWorkspaceUsageStats,
  type WorkspaceUsageStats,
} from "@/lib/settings/workspaceUsageApi";

export interface UseWorkspaceUsageStatsResult {
  stats: WorkspaceUsageStats | null;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

export function useWorkspaceUsageStats(): UseWorkspaceUsageStatsResult {
  const [stats, setStats] = useState<WorkspaceUsageStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const token = getStoredAccessToken();
      const ws = getStoredActiveWorkspaceId();
      if (!token?.trim() || !ws?.trim()) {
        setStats(null);
        setError("Select a workspace to view usage.");
        return;
      }
      const data = await fetchWorkspaceUsageStats(token, ws);
      setStats(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load usage");
      setStats(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return { stats, loading, error, refresh };
}
