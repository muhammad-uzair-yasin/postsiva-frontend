"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { adminSend } from "@/lib/admin/adminFetch";
import type { ProviderHealthResult } from "@/lib/admin/aiManagerApi";

export interface HealthState {
  checking: boolean;
  result: ProviderHealthResult | null;
  error: string | null;
}

/** Per-provider live health probes (POST /admin/api/ai/manager/provider-health/{id}). */
export function useProviderHealth() {
  const [states, setStates] = useState<Record<string, HealthState>>({});
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  const runCheck = useCallback(async (providerId: string) => {
    setStates((prev) => ({
      ...prev,
      [providerId]: { checking: true, result: null, error: null },
    }));
    try {
      const result = await adminSend<ProviderHealthResult>(
        "POST",
        `/admin/api/ai/manager/provider-health/${encodeURIComponent(providerId)}`,
      );
      if (!mounted.current) return;
      setStates((prev) => ({
        ...prev,
        [providerId]: { checking: false, result, error: null },
      }));
    } catch (err) {
      if (!mounted.current) return;
      const message = err instanceof Error ? err.message : "Probe failed";
      setStates((prev) => ({
        ...prev,
        [providerId]: { checking: false, result: null, error: message },
      }));
    }
  }, []);

  return { states, runCheck };
}
