"use client";

import { useCallback, useEffect, useState } from "react";

import {
  buildGrantsFromWorkspaces,
  fetchInsightsSnapshotUser,
  fetchInsightsSnapshotUsers,
  saveInsightsSnapshotUser,
  type InsightsSnapshotUserDetail,
  type InsightsSnapshotUserListItem,
} from "@/lib/admin/insightsSnapshotsApi";

export function useInsightsSnapshots() {
  const [rows, setRows] = useState<InsightsSnapshotUserListItem[]>([]);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");
  const [insightsOnly, setInsightsOnly] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [detail, setDetail] = useState<InsightsSnapshotUserDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const loadList = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchInsightsSnapshotUsers({
        search: search || undefined,
        insights_only: insightsOnly,
        limit: 100,
      });
      setRows(res.items);
      setTotal(res.total);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load users");
    } finally {
      setLoading(false);
    }
  }, [search, insightsOnly]);

  useEffect(() => {
    void loadList();
  }, [loadList]);

  const selectUser = useCallback(async (userId: string | null) => {
    setSelectedId(userId);
    setDetail(null);
    if (!userId) return;
    setDetailLoading(true);
    try {
      const d = await fetchInsightsSnapshotUser(userId);
      setDetail(JSON.parse(JSON.stringify(d)) as InsightsSnapshotUserDetail);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load user detail");
    } finally {
      setDetailLoading(false);
    }
  }, []);

  const saveDetail = useCallback(async () => {
    if (!detail) return false;
    setSaving(true);
    setError(null);
    try {
      const body = {
        insights_enabled: detail.insights_enabled,
        scope_mode: detail.scope_mode as "all" | "custom",
        grants:
          detail.scope_mode === "custom"
            ? buildGrantsFromWorkspaces(detail.workspaces)
            : [],
      };
      const updated = await saveInsightsSnapshotUser(detail.user_id, body);
      setDetail(JSON.parse(JSON.stringify(updated)) as InsightsSnapshotUserDetail);
      await loadList();
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save");
      return false;
    } finally {
      setSaving(false);
    }
  }, [detail, loadList]);

  return {
    rows,
    total,
    search,
    insightsOnly,
    loading,
    error,
    selectedId,
    detail,
    detailLoading,
    saving,
    setSearch,
    setInsightsOnly,
    setDetail,
    loadList,
    selectUser,
    saveDetail,
  };
}
