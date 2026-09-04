"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { adminGet, adminSend } from "@/lib/admin/adminFetch";
import {
  type AdminCustomerRow,
  type AdminCustomersResponse,
  type AdminOverviewResponse,
  type AiUsageProviderId,
  type ProviderRefreshResult,
  aiUsagePaths,
  refreshOutcomeMessage,
} from "@/lib/admin/aiUsageAdminApi";

export interface ProviderRefreshOutcome {
  kind: "ok" | "cooldown" | "error";
  message: string;
}

interface FinancialsState {
  overview: AdminOverviewResponse | null;
  customers: AdminCustomerRow[];
  loading: boolean;
  error: string | null;
}

/** Loads the admin financial overview + customers, and drives provider refreshes. */
export function useAiUsageFinancials() {
  const [state, setState] = useState<FinancialsState>({
    overview: null,
    customers: [],
    loading: true,
    error: null,
  });
  const [refreshing, setRefreshing] = useState<Partial<Record<AiUsageProviderId, boolean>>>({});
  const [refreshOutcome, setRefreshOutcome] = useState<
    Partial<Record<AiUsageProviderId, ProviderRefreshOutcome>>
  >({});
  const abortRef = useRef<AbortController | null>(null);

  const load = useCallback(async () => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    setState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const [overview, customers] = await Promise.all([
        adminGet<AdminOverviewResponse>(aiUsagePaths.overview(), controller.signal),
        adminGet<AdminCustomersResponse>(aiUsagePaths.customers(), controller.signal),
      ]);
      if (controller.signal.aborted) return;
      setState({
        overview,
        customers: customers.items ?? [],
        loading: false,
        error: null,
      });
    } catch (cause) {
      if (controller.signal.aborted) return;
      setState((prev) => ({
        ...prev,
        loading: false,
        error:
          cause instanceof Error ? cause.message : "Unable to load AI financial data",
      }));
    }
  }, []);

  useEffect(() => {
    void load();
    return () => abortRef.current?.abort();
  }, [load]);

  const refreshProvider = useCallback(
    async (provider: AiUsageProviderId) => {
      setRefreshing((prev) => ({ ...prev, [provider]: true }));
      setRefreshOutcome((prev) => ({ ...prev, [provider]: undefined }));
      try {
        const result = await adminSend<ProviderRefreshResult>(
          "POST",
          aiUsagePaths.providerRefresh(provider),
        );
        const outcome = refreshOutcomeMessage(result);
        setRefreshOutcome((prev) => ({ ...prev, [provider]: outcome }));
        if (outcome.kind !== "cooldown") {
          await load();
        }
      } catch (cause) {
        setRefreshOutcome((prev) => ({
          ...prev,
          [provider]: {
            kind: "error",
            message:
              cause instanceof Error ? cause.message : "Provider refresh failed.",
          },
        }));
      } finally {
        setRefreshing((prev) => ({ ...prev, [provider]: false }));
      }
    },
    [load],
  );

  return {
    overview: state.overview,
    customers: state.customers,
    loading: state.loading,
    error: state.error,
    reload: load,
    refreshProvider,
    refreshing,
    refreshOutcome,
  };
}
