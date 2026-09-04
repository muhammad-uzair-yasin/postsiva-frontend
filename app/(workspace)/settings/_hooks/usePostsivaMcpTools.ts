"use client";

import { useCallback, useEffect, useState } from "react";

import {
  fetchPostsivaMcpTools,
  type FetchMcpToolsResult,
} from "@/lib/mcp/fetchPostsivaMcpTools";

export interface UsePostsivaMcpToolsResult {
  loading: boolean;
  error: string | null;
  data: FetchMcpToolsResult | null;
  refresh: () => Promise<void>;
}

export function usePostsivaMcpTools(
  baseUrl: string,
  apiKey: string | null,
): UsePostsivaMcpToolsResult {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<FetchMcpToolsResult | null>(null);

  const refresh = useCallback(async () => {
    const k = apiKey?.trim();
    if (!k) {
      setLoading(false);
      setError(null);
      setData(null);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const r = await fetchPostsivaMcpTools(baseUrl, k);
      setData(r);
    } catch (e) {
      setData(null);
      setError(e instanceof Error ? e.message : "Failed to load MCP tools");
    } finally {
      setLoading(false);
    }
  }, [baseUrl, apiKey]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return { loading, error, data, refresh };
}
