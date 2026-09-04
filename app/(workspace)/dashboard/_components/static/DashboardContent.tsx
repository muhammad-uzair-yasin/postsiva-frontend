"use client";

import { motion } from "framer-motion";
import type { ReactElement } from "react";

import { UpgradeRequiredBanner } from "@/components/billing/UpgradeRequiredBanner";
import { useTranslations } from "@/lib/i18n/WorkspaceLocaleProvider";
import {
  workspaceListContainer,
  workspaceListItem,
} from "@/lib/ui/workspaceMotionVariants";

import { useWorkspaceHeaderAccounts } from "../../../_components/WorkspaceHeaderAccountsProvider";
import { useDashboardPageLoading } from "../../_hooks/useDashboardPageLoading";
import { DashboardConnectFirstAccountEmpty } from "../DashboardConnectFirstAccountEmpty";
import { DashboardAnalyticsSection } from "./DashboardAnalyticsSection";
import { DashboardInspirations } from "./DashboardInspirations";
import { DashboardPageLoading } from "./DashboardPageLoading";
import { DashboardProfileHeader } from "./DashboardProfileHeader";

export function DashboardContent(): ReactElement {
  const { t } = useTranslations();
  const {
    isPageLoading,
    analyticsEnabled,
    planLoading,
    analytics,
    posts,
  } = useDashboardPageLoading();
  const { hasAnySocialConnection, isConnectGateLoading } =
    useWorkspaceHeaderAccounts();

  if (isPageLoading || isConnectGateLoading) {
    return <DashboardPageLoading />;
  }

  if (!hasAnySocialConnection) {
    return <DashboardConnectFirstAccountEmpty />;
  }

  return (
    <motion.div
      className="w-full max-w-none"
      variants={workspaceListContainer}
      initial="hidden"
      animate="show"
    >
      <motion.div variants={workspaceListItem}>
        <DashboardProfileHeader />
      </motion.div>

      {planLoading ? null : analyticsEnabled ? (
        <DashboardAnalyticsSection analytics={analytics} postsState={posts} />
      ) : (
        <>
          <motion.div variants={workspaceListItem} className="mt-4">
            <UpgradeRequiredBanner featureLabel={t("dashboard.upgradeAnalytics")} />
          </motion.div>
          <motion.div variants={workspaceListItem}>
            <DashboardInspirations />
          </motion.div>
        </>
      )}
    </motion.div>
  );
}
