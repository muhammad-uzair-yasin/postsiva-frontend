"use client";

import type { ReactElement } from "react";

import { useWorkspaceAccountSettings } from "@/app/(workspace)/_components/shell/WorkspaceAccountSettingsProvider";
import { useBilling } from "@/lib/billing/BillingContext";
import { useTranslations } from "@/lib/i18n/WorkspaceLocaleProvider";

function planDisplayName(planId: string): string {
  return planId.charAt(0).toUpperCase() + planId.slice(1);
}

function upgradeHintKey(
  planId: string,
): "planUpgradeHintFree" | "planUpgradeHintStarter" | "planUpgradeHintDefault" {
  const normalized = planId === "agency" ? "pro" : planId;
  if (normalized === "free") return "planUpgradeHintFree";
  if (normalized === "starter") return "planUpgradeHintStarter";
  return "planUpgradeHintDefault";
}

export function WorkspaceShellPlanSummary(): ReactElement | null {
  const { t } = useTranslations();
  const { openBillingSettings } = useWorkspaceAccountSettings();
  const { usage, loading, planId, error } = useBilling();
  const effectivePlan = usage?.plan_id ?? planId;
  const normalizedPlan = effectivePlan === "agency" ? "pro" : effectivePlan;
  const showUpgradeCta = normalizedPlan === "free" || normalizedPlan === "starter";

  if ((loading && !usage) || (!usage && error)) {
    return (
      <div className="hidden min-w-0 items-center gap-2 md:flex" aria-busy>
        <span className="truncate text-xs text-on-surface-variant">{t("dashboard.planLoading")}</span>
      </div>
    );
  }

  if (!usage) {
    return null;
  }

  const postsLeft = usage?.remaining.posts;
  const aiLeft = usage?.remaining.ai_credits;

  const statsParts: string[] = [];
  if (postsLeft !== undefined) {
    statsParts.push(t("dashboard.planPostsLeft", { count: postsLeft }));
  }
  if (aiLeft !== undefined) {
    statsParts.push(t("dashboard.planAiCreditsLeft", { count: aiLeft.toLocaleString() }));
  }
  if (usage?.billing_interval) {
    statsParts.push(
      t("dashboard.planBilledInterval", { interval: usage.billing_interval }),
    );
  }
  const statsLine = statsParts.join(" · ");

  return (
    <div className="hidden min-w-0 md:block">
      <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
        <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-primary">
          {t("dashboard.planCurrentPlan")}
        </span>
        {usage?.billing_status && usage.billing_status !== "none" ? (
          <span className="rounded-full bg-surface-container-high px-2 py-px text-[10px] font-semibold capitalize text-on-surface-variant">
            {usage.billing_status.replace(/_/g, " ")}
          </span>
        ) : null}
      </div>
      <div className="flex min-w-0 items-baseline gap-2 leading-tight">
        <span className="shrink-0 text-lg font-black text-on-surface">
          {planDisplayName(normalizedPlan)}
        </span>
        {statsLine ? (
          <span className="truncate text-[11px] text-on-surface-variant">{statsLine}</span>
        ) : null}
      </div>
      {showUpgradeCta ? (
        <button
          type="button"
          onClick={() => openBillingSettings()}
          className="mt-1 text-left text-[11px] font-bold text-primary hover:underline"
        >
          {t("dashboard.planUpgradePlan")} — {t(`dashboard.${upgradeHintKey(normalizedPlan)}`)}
        </button>
      ) : null}
    </div>
  );
}
