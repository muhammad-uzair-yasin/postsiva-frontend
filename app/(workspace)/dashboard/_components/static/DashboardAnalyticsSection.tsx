"use client";

import { motion } from "framer-motion";
import type { ReactElement } from "react";

import { workspaceListItem } from "@/lib/ui/workspaceMotionVariants";

import type { UseDashboardUnifiedAnalyticsResult } from "../../_hooks/useDashboardUnifiedAnalytics";
import type { UseDashboardUnifiedPostsResult } from "../../_hooks/useDashboardUnifiedPosts";
import { DashboardEngagementChart } from "./DashboardEngagementChart";
import { DashboardInspirations } from "./DashboardInspirations";
import { DashboardMetricsBento } from "./DashboardMetricsBento";
import { DashboardRecentPosts } from "./DashboardRecentPosts";

interface DashboardAnalyticsSectionProps {
  readonly analytics: UseDashboardUnifiedAnalyticsResult;
  readonly postsState: UseDashboardUnifiedPostsResult;
}

/** Temporary: chart is static placeholder — keep component, hide until live data. */
const SHOW_ENGAGEMENT_CHART = false;

/** Analytics widgets — mounted only when plan includes analytics (avoids gated API calls). */
export function DashboardAnalyticsSection({
  analytics,
  postsState,
}: DashboardAnalyticsSectionProps): ReactElement {

  return (
    <>
      <motion.div variants={workspaceListItem}>
        <DashboardMetricsBento analytics={analytics} />
      </motion.div>
      {SHOW_ENGAGEMENT_CHART ? (
        <motion.div variants={workspaceListItem}>
          <DashboardEngagementChart analytics={analytics} />
        </motion.div>
      ) : null}
      <motion.div variants={workspaceListItem}>
        <DashboardInspirations />
      </motion.div>
      <motion.div variants={workspaceListItem}>
        <DashboardRecentPosts postsState={postsState} />
      </motion.div>
    </>
  );
}
