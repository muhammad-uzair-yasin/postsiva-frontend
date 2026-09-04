"use client";

import { useMemo } from "react";

import { usePlanFeature } from "@/lib/billing/BillingContext";

import { useDashboardUnifiedAnalytics } from "./useDashboardUnifiedAnalytics";
import { useDashboardUnifiedPosts } from "./useDashboardUnifiedPosts";

export function useDashboardPageLoading(): {
  /** True only while billing plan feature flags resolve — not analytics/posts. */
  readonly isPageLoading: boolean;
  readonly analyticsEnabled: boolean;
  readonly planLoading: boolean;
  readonly analytics: ReturnType<typeof useDashboardUnifiedAnalytics>;
  readonly posts: ReturnType<typeof useDashboardUnifiedPosts>;
} {
  const { enabled: analyticsEnabled, loading: planLoading } =
    usePlanFeature("analytics_enabled");

  const fetchAnalyticsData = !planLoading && analyticsEnabled;
  const analytics = useDashboardUnifiedAnalytics({ enabled: fetchAnalyticsData });
  const posts = useDashboardUnifiedPosts({ enabled: fetchAnalyticsData });

  const isPageLoading = useMemo((): boolean => planLoading, [planLoading]);

  return {
    isPageLoading,
    analyticsEnabled,
    planLoading,
    analytics,
    posts,
  };
}
