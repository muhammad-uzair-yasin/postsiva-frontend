"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { adminGet } from "@/lib/admin/adminFetch";
import type { TrackingDashboardResponse } from "@/lib/admin/trackingApi";

export interface TrackingDashboardState {
  data: TrackingDashboardResponse | null;
  loading: boolean;
  error: string | null;
  refresh: () => void;
}

/** Loads GET /admin/api/tracking/dashboard with abort-on-unmount + manual refresh. */
export function useTrackingDashboard(): TrackingDashboardState {
  const [data, setData] = useState<TrackingDashboardResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const controllerRef = useRef<AbortController | null>(null);

  const load = useCallback(() => {
    controllerRef.current?.abort();
    const controller = new AbortController();
    controllerRef.current = controller;
    setLoading(true);
    setError(null);
    adminGet<TrackingDashboardResponse>(
      "/admin/api/tracking/dashboard",
      controller.signal,
    )
      .then((res) => {
        if (controller.signal.aborted) return;
        setData(res);
        setLoading(false);
      })
      .catch((e: unknown) => {
        if (controller.signal.aborted) return;
        setError(e instanceof Error ? e.message : "Failed to load tracking dashboard");
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    void Promise.resolve().then(load);
    return () => controllerRef.current?.abort();
  }, [load]);

  return { data, loading, error, refresh: load };
}
