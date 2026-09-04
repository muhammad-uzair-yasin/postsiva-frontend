"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactElement,
  type ReactNode,
} from "react";

import { ensureActiveWorkspaceId } from "@/lib/auth/ensureActiveWorkspace";
import { fetchBillingUsage, type BillingUsage } from "@/lib/billing/billingApi";
import { SOCIAL_OAUTH_STATUS_UPDATED_EVENT } from "@/lib/social/unifiedOAuthApi";
import {
  getStoredAccessToken,
  getStoredActiveWorkspaceId,
  POSTSIVA_ACTIVE_WORKSPACE_CHANGED,
  POSTSIVA_WORKSPACES_CHANGED,
} from "@/lib/auth/session";

export interface BillingContextValue {
  usage: BillingUsage | null;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<BillingUsage | null>;
  hasFeature: (feature: string) => boolean;
  planId: string;
}

const BillingContext = createContext<BillingContextValue | null>(null);

export function BillingProvider({ children }: { children: ReactNode }): ReactElement {
  const [usage, setUsage] = useState<BillingUsage | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async (): Promise<BillingUsage | null> => {
    setLoading(true);
    setError(null);
    try {
      const token = getStoredAccessToken();
      if (!token?.trim()) {
        setUsage(null);
        return null;
      }
      ensureActiveWorkspaceId();
      const ws = getStoredActiveWorkspaceId();
      const data = await fetchBillingUsage(token, ws ?? undefined);
      setUsage(data);
      return data;
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load billing");
      setUsage(null);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  useEffect(() => {
    const onRefresh = (): void => {
      void refresh();
    };
    window.addEventListener(POSTSIVA_ACTIVE_WORKSPACE_CHANGED, onRefresh);
    window.addEventListener(POSTSIVA_WORKSPACES_CHANGED, onRefresh);
    window.addEventListener(SOCIAL_OAUTH_STATUS_UPDATED_EVENT, onRefresh);
    return () => {
      window.removeEventListener(POSTSIVA_ACTIVE_WORKSPACE_CHANGED, onRefresh);
      window.removeEventListener(POSTSIVA_WORKSPACES_CHANGED, onRefresh);
      window.removeEventListener(SOCIAL_OAUTH_STATUS_UPDATED_EVENT, onRefresh);
    };
  }, [refresh]);

  const value = useMemo<BillingContextValue>(
    () => ({
      usage,
      loading,
      error,
      refresh,
      hasFeature: (feature: string) => Boolean(usage?.features?.[feature]),
      planId: usage?.plan_id ?? "free",
    }),
    [usage, loading, error, refresh],
  );

  return <BillingContext.Provider value={value}>{children}</BillingContext.Provider>;
}

export function useBilling(): BillingContextValue {
  const ctx = useContext(BillingContext);
  if (!ctx) {
    throw new Error("useBilling must be used within BillingProvider");
  }
  return ctx;
}

export function usePlanFeature(feature: string): {
  enabled: boolean;
  loading: boolean;
  planId: string;
  billingError: string | null;
  hasUsage: boolean;
} {
  const { hasFeature, loading, planId, error, usage } = useBilling();
  const pending = loading || (!usage && !error);
  return {
    enabled: usage ? hasFeature(feature) : false,
    loading: pending,
    planId,
    billingError: error,
    hasUsage: usage !== null,
  };
}
