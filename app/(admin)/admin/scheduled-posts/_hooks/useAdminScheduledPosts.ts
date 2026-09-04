"use client";

import { useCallback, useEffect, useState } from "react";

import {
  cancelAdminScheduledPost,
  fetchAdminScheduledPosts,
  publishAdminScheduledPostNow,
  type AdminScheduledPostRow,
} from "@/lib/admin/scheduledPostsClient";

export function useAdminScheduledPosts() {
  const [rows, setRows] = useState<AdminScheduledPostRow[]>([]);
  const [total, setTotal] = useState(0);
  const [status, setStatus] = useState("");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [actingId, setActingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchAdminScheduledPosts({
        status: status || undefined,
        search: search || undefined,
        limit: 200,
      });
      setRows(res.items);
      setTotal(res.total);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load scheduled posts");
    } finally {
      setLoading(false);
    }
  }, [status, search]);

  useEffect(() => {
    void load();
  }, [load]);

  const cancelPost = useCallback(async (id: string) => {
    setActingId(id);
    setMessage(null);
    setError(null);
    try {
      const res = await cancelAdminScheduledPost(id);
      setMessage(res.message || "Cancelled");
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Cancel failed");
    } finally {
      setActingId(null);
    }
  }, [load]);

  const publishNow = useCallback(async (id: string) => {
    setActingId(id);
    setMessage(null);
    setError(null);
    try {
      const res = await publishAdminScheduledPostNow(id);
      setMessage(res.message || "Published");
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Publish failed");
    } finally {
      setActingId(null);
    }
  }, [load]);

  return {
    rows,
    total,
    status,
    search,
    loading,
    actingId,
    error,
    message,
    setStatus,
    setSearch,
    load,
    cancelPost,
    publishNow,
  };
}
