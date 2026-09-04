"use client";

import { useCallback, useEffect, useState } from "react";

import { useActiveWorkspaceId } from "@/app/(workspace)/_hooks/useActiveWorkspaceId";
import { fetchAiUsageEvents, fetchAiUsageSummary } from "@/lib/aiUsage/aiUsageApi";
import type { AiUsageEventFilters, AiUsageEventsPage, AiUsageSummary } from "@/lib/aiUsage/types";
import { getStoredAccessToken } from "@/lib/auth/session";

export function useAiUsage(workspaceIdOverride?: string | null) {
  const activeWorkspaceId = useActiveWorkspaceId();
  const workspaceId =
    workspaceIdOverride !== undefined ? workspaceIdOverride : activeWorkspaceId;
  const [summary, setSummary] = useState<AiUsageSummary | null>(null);
  const [events, setEvents] = useState<AiUsageEventsPage>({ items: [] });
  const [filters, setFilters] = useState<AiUsageEventFilters>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    const token = getStoredAccessToken();
    if (!token || !workspaceId) {
      setError(!token ? "Authentication required" : "Workspace required");
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const [nextSummary, nextEvents] = await Promise.all([
        fetchAiUsageSummary(token, workspaceId),
        fetchAiUsageEvents(token, workspaceId, filters),
      ]);
      setSummary(nextSummary);
      setEvents(nextEvents);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Unable to load AI usage");
    } finally {
      setLoading(false);
    }
  }, [filters, workspaceId]);

  const loadMore = useCallback(async () => {
    const token = getStoredAccessToken();
    if (!token || !workspaceId || !events.next_cursor) return;
    const page = await fetchAiUsageEvents(token, workspaceId, { ...filters, cursor: events.next_cursor });
    setEvents((current) => ({ items: [...current.items, ...page.items], next_cursor: page.next_cursor }));
  }, [events.next_cursor, filters, workspaceId]);

  useEffect(() => void load(), [load]);
  return { summary, events, filters, setFilters, loading, error, load, loadMore };
}
