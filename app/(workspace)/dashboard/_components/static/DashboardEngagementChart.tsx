"use client";

import { motion } from "framer-motion";
import type { ReactElement } from "react";

import { formatEngagementRate } from "@/lib/dashboard/formatAnalyticsDisplay";
import { useTranslations } from "@/lib/i18n/WorkspaceLocaleProvider";

import type { UseDashboardUnifiedAnalyticsResult } from "../../_hooks/useDashboardUnifiedAnalytics";
import { ENGAGEMENT_DAY_BARS } from "../../_data/dashboardStaticData";

interface DashboardEngagementChartProps {
  readonly analytics: UseDashboardUnifiedAnalyticsResult;
}

export function DashboardEngagementChart({
  analytics,
}: DashboardEngagementChartProps): ReactElement {
  const { t } = useTranslations();
  const { slice, isLoading } = analytics;

  const engagementHeadline = isLoading
    ? null
    : slice !== null
      ? formatEngagementRate(slice.average_engagement_rate, 2)
      : "—";

  return (
    <section className="mb-12">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 260, damping: 28 }}
        className="rounded-2xl border border-outline-variant/10 bg-surface-container/80 p-5 shadow-[0_16px_40px_-20px_rgba(0,0,0,0.45)] ring-1 ring-white/5 backdrop-blur-sm sm:p-8"
      >
        <div className="mb-8 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <h2 className="mb-2 text-2xl font-extrabold text-on-surface">
              {t("dashboard.engagementRateTitle")}
            </h2>
            <p
              className={`mb-1 text-3xl font-black tracking-tight text-secondary ${isLoading ? "animate-pulse" : ""}`}
            >
              {isLoading ? (
                <span className="inline-block h-9 w-28 rounded-md bg-on-surface/10 align-middle" />
              ) : (
                engagementHeadline
              )}
            </p>
            <p className="text-sm text-on-surface-variant">
              {t("dashboard.engagementRateSubtitle")}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-secondary shadow-[0_0_12px_rgba(84,220,191,0.6)]" />
            <span className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">
              {t("dashboard.engagementReels")}
            </span>
          </div>
        </div>
        <div className="flex h-48 items-end justify-between gap-1 sm:h-64 sm:gap-2 md:gap-8">
          {ENGAGEMENT_DAY_BARS.map((day, barIndex) => (
            <div
              key={day.label}
              className="flex min-h-0 flex-1 flex-col items-center gap-3"
            >
              <div className="flex h-48 w-full flex-col justify-end">
                <motion.div
                  className="glow-bar w-full rounded-t-md bg-gradient-to-t from-secondary to-secondary-fixed"
                  initial={{ height: 0, opacity: 0.6 }}
                  animate={{
                    height: `${day.reelsPct}%`,
                    opacity: 1,
                  }}
                  transition={{
                    type: "spring",
                    stiffness: 320,
                    damping: 28,
                    delay: barIndex * 0.05,
                  }}
                />
              </div>
              <span className="text-xs font-bold uppercase text-on-surface-variant">
                {day.label}
              </span>
            </div>
          ))}
        </div>
      </motion.div>
    </section>
  );
}
