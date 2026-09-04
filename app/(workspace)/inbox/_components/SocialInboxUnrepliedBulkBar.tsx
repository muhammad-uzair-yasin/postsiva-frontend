"use client";

import { motion } from "framer-motion";
import type { ReactElement } from "react";

import { OpenBillingButton } from "@/components/billing/OpenBillingButton";
import { UpgradeRequiredBanner } from "@/components/billing/UpgradeRequiredBanner";
import { useTranslations } from "@/lib/i18n/WorkspaceLocaleProvider";
import { resolveBillingFeatureLabel } from "@/lib/i18n/resolveBillingFeatureLabel";

interface SocialInboxUnrepliedBulkBarProps {
  readonly bulkTargetCount: number;
  readonly readyToPostCount: number;
  readonly bulkBusy: boolean;
  readonly bulkAllGenerating: boolean;
  readonly bulkAllPosting: boolean;
  readonly commentAiEnabled: boolean;
  readonly onGenerateAll: () => void;
  readonly onPostAll: () => void;
}

export function SocialInboxUnrepliedBulkBar({
  bulkTargetCount,
  readyToPostCount,
  bulkBusy,
  bulkAllGenerating,
  bulkAllPosting,
  commentAiEnabled,
  onGenerateAll,
  onPostAll,
}: SocialInboxUnrepliedBulkBarProps): ReactElement {
  const { t } = useTranslations();

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ type: "spring", stiffness: 320, damping: 32 }}
      className="shrink-0 border-b border-secondary/20 bg-gradient-to-r from-secondary/5 via-surface-container-low/50 to-primary/5 px-4 py-3 sm:px-6 md:px-8 lg:px-10"
    >
      <p className="text-[10px] font-extrabold uppercase tracking-[0.12em] text-secondary">
        {t("inbox.bulkTitle")}
      </p>
      <p className="mt-1 text-[11px] leading-relaxed text-on-surface-variant">
        {t("inbox.bulkHint", { count: bulkTargetCount })}
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        {commentAiEnabled ? (
          <motion.button
            type="button"
            disabled={bulkBusy}
            whileHover={{ scale: bulkBusy ? 1 : 1.02 }}
            whileTap={{ scale: bulkBusy ? 1 : 0.98 }}
            className="rounded-xl bg-primary-container px-3 py-2 text-xs font-bold text-on-primary-container shadow-md shadow-primary/15 transition-opacity disabled:cursor-not-allowed disabled:opacity-40 motion-reduce:transform-none"
            onClick={onGenerateAll}
          >
            {bulkAllGenerating
              ? t("inbox.bulkGenerating")
              : t("inbox.bulkGenerateAll", { count: bulkTargetCount })}
          </motion.button>
        ) : (
          <OpenBillingButton
            className="inline-flex items-center gap-1.5 rounded-xl border border-outline-variant/20 bg-surface-container-high px-3 py-2 text-xs font-bold text-on-surface-variant"
          >
            <span className="material-symbols-outlined text-sm">lock</span>
            {t("inbox.bulkUpgradePro")}
          </OpenBillingButton>
        )}
        <motion.button
          type="button"
          disabled={bulkBusy || readyToPostCount === 0}
          whileHover={{
            scale: bulkBusy || readyToPostCount === 0 ? 1 : 1.02,
          }}
          whileTap={{
            scale: bulkBusy || readyToPostCount === 0 ? 1 : 0.98,
          }}
          className="rounded-xl bg-primary px-3 py-2 text-xs font-bold text-on-primary shadow-md shadow-primary/20 transition-opacity disabled:cursor-not-allowed disabled:opacity-40 motion-reduce:transform-none"
          onClick={onPostAll}
        >
          {bulkAllPosting
            ? t("inbox.bulkPosting")
            : t("inbox.bulkPostAll", { count: readyToPostCount })}
        </motion.button>
      </div>
      {!commentAiEnabled ? (
        <div className="mt-3">
          <UpgradeRequiredBanner
            featureLabel={resolveBillingFeatureLabel(t, "auto_replier_enabled")}
            compact
          />
        </div>
      ) : null}
    </motion.div>
  );
}
