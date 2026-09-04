"use client";

import { motion } from "framer-motion";
import type { ReactElement } from "react";

import { formatAnalyticsCount } from "@/lib/dashboard/formatAnalyticsDisplay";
import type { UnifiedAnalyticsPlatformSlice } from "@/lib/dashboard/unifiedAnalyticsTypes";
import { useTranslations } from "@/lib/i18n/WorkspaceLocaleProvider";
import {
  workspaceListContainer,
  workspaceListItem,
} from "@/lib/ui/workspaceMotionVariants";

import type { UseDashboardUnifiedAnalyticsResult } from "../../_hooks/useDashboardUnifiedAnalytics";

interface MetricDef {
  readonly labelKey: string;
  readonly icon: string;
  readonly iconTone: "primary" | "secondary";
  readonly highlight?: boolean;
  readonly pick: (s: UnifiedAnalyticsPlatformSlice) => number;
}

const METRICS: readonly MetricDef[] = [
  {
    labelKey: "dashboard.metricPost",
    icon: "edit_note",
    iconTone: "primary",
    pick: (s) => s.post_count,
  },
  {
    labelKey: "dashboard.metricComments",
    icon: "chat_bubble",
    iconTone: "secondary",
    pick: (s) => s.total_comments,
  },
  {
    labelKey: "dashboard.metricReach",
    icon: "travel_explore",
    iconTone: "primary",
    highlight: true,
    pick: (s) => s.total_reach,
  },
  {
    labelKey: "dashboard.metricLikes",
    icon: "favorite",
    iconTone: "secondary",
    pick: (s) => s.total_likes,
  },
];

function MetricSkeleton(): ReactElement {
  return (
    <div className="flex h-36 flex-col justify-between rounded-2xl border border-outline-variant/10 bg-surface-container p-4 inbox-skeleton-shimmer sm:h-40">
      <div className="flex justify-between">
        <div className="h-6 w-6 rounded bg-on-surface/10" />
        <div className="h-5 w-12 rounded bg-on-surface/10" />
      </div>
      <div>
        <div className="mb-2 h-10 w-28 rounded bg-on-surface/10" />
        <div className="h-4 w-20 rounded bg-on-surface/10" />
      </div>
    </div>
  );
}

interface DashboardMetricsBentoProps {
  readonly analytics: UseDashboardUnifiedAnalyticsResult;
}

export function DashboardMetricsBento({
  analytics,
}: DashboardMetricsBentoProps): ReactElement {
  const { t } = useTranslations();
  const { slice, isLoading, error } = analytics;

  const showSkeleton = isLoading;

  return (
    <section className="mb-5 sm:mb-8" aria-label={t("dashboard.analyticsAria")}>
      {error !== null ? (
        <p className="mb-4 rounded-lg border border-error/30 bg-error/5 px-4 py-3 text-sm text-error">
          {error}
        </p>
      ) : null}

      <motion.div
        className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 xl:grid-cols-4"
        variants={workspaceListContainer}
        initial="hidden"
        animate="show"
      >
        {showSkeleton
          ? Array.from({ length: 4 }, (_, i) => (
              <motion.div key={`sk-${i}`} variants={workspaceListItem}>
                <MetricSkeleton />
              </motion.div>
            ))
          : METRICS.map((card) => {
              const iconClass =
                card.iconTone === "primary"
                  ? "text-primary"
                  : "text-secondary";
              const value =
                slice !== null
                  ? formatAnalyticsCount(card.pick(slice))
                  : "—";
              const label = t(card.labelKey);

              if (card.highlight) {
                return (
                  <motion.div key={card.labelKey} variants={workspaceListItem}>
                    <motion.div
                      whileHover={{
                        y: -4,
                        transition: { type: "spring", stiffness: 400, damping: 22 },
                      }}
                      className="group relative flex min-h-24 flex-col justify-between overflow-hidden rounded-2xl border border-primary/20 bg-surface-container-highest p-4 shadow-lg shadow-primary/10 sm:min-h-32 sm:p-5 motion-reduce:transform-none"
                    >
                      <div className="absolute inset-0 bg-gradient-to-br from-primary-container/15 via-transparent to-secondary/10 opacity-80 transition-opacity group-hover:opacity-100" />
                      <div className="relative z-10 flex items-start justify-between">
                        <span
                          className={`material-symbols-outlined ${iconClass}`}
                        >
                          {card.icon}
                        </span>
                        <span
                          className="min-h-[1.25rem] text-right text-xs font-semibold text-on-surface-variant"
                          aria-hidden
                        />
                      </div>
                      <div className="relative z-10">
                        <h3 className="text-3xl font-black tracking-tighter text-on-surface sm:text-4xl">
                          {value}
                        </h3>
                        <p className="text-sm font-medium text-on-surface-variant">
                          {label}
                        </p>
                      </div>
                    </motion.div>
                  </motion.div>
                );
              }

              return (
                <motion.div key={card.labelKey} variants={workspaceListItem}>
                  <motion.div
                    whileHover={{
                      y: -3,
                      transition: { type: "spring", stiffness: 400, damping: 24 },
                    }}
                    className="flex min-h-24 flex-col justify-between rounded-2xl border border-outline-variant/10 bg-surface-container p-4 shadow-md ring-1 ring-white/5 transition-shadow hover:border-outline-variant/20 hover:shadow-lg sm:min-h-32 sm:p-5 motion-reduce:transform-none"
                  >
                    <div className="flex items-start justify-between">
                      <span
                        className={`material-symbols-outlined ${iconClass}`}
                      >
                        {card.icon}
                      </span>
                      <span
                        className="min-h-[1.25rem] text-xs font-semibold text-on-surface-variant"
                        aria-hidden
                      />
                    </div>
                    <div>
                      <h3 className="text-3xl font-black tracking-tighter text-on-surface sm:text-4xl">
                        {value}
                      </h3>
                      <p className="text-sm font-medium text-on-surface-variant">
                        {label}
                      </p>
                    </div>
                  </motion.div>
                </motion.div>
              );
            })}
      </motion.div>
    </section>
  );
}
