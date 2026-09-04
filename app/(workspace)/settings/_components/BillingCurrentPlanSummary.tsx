"use client";

import { ExternalLink, Loader2 } from "lucide-react";
import type { ReactElement } from "react";

import type { BillingPlanPublic, BillingUsage } from "@/lib/billing/billingApi";
import { planDisplayName } from "@/lib/billing/planCardCopy";
import { useTranslations } from "@/lib/i18n/WorkspaceLocaleProvider";

import { BillingPlanDetailsBlock } from "./BillingPlanDetailsBlock";

type BillingCurrentPlanSummaryProps = {
  usage: BillingUsage;
  plan: BillingPlanPublic | undefined;
  portalBusy: boolean;
  onManagePortal: () => void;
};

function UsageMeter({
  label,
  used,
  limit,
}: {
  label: string;
  used: number;
  limit: number;
}): ReactElement {
  const pct = limit > 0 ? Math.min(100, Math.round((used / limit) * 100)) : 0;
  return (
    <div className="rounded-xl border border-outline-variant/15 bg-surface-container-low p-4">
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium text-on-surface">{label}</span>
        <span className="text-on-surface-variant">
          {used} / {limit}
        </span>
      </div>
      <div className="mt-2 h-2 overflow-hidden rounded-full bg-surface-container-high">
        <div
          className="h-full rounded-full bg-primary transition-all"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

function billingStatusLabel(status: string): string {
  return status === "none" ? "No active subscription" : status.replace(/_/g, " ");
}

export function BillingCurrentPlanSummary({
  usage,
  plan,
  portalBusy,
  onManagePortal,
}: BillingCurrentPlanSummaryProps): ReactElement {
  const { t } = useTranslations();
  const planLabel = planDisplayName(usage.plan_id);
  const isPastDue = usage.billing_status === "past_due";
  const graceExpired = Boolean(usage.past_due_grace_expired);
  const daysRemaining =
    usage.past_due_days_remaining ?? usage.past_due_grace_days ?? 5;
  const pastDuePlanLabel =
    usage.plan_id === "free" ? "Pro" : planLabel;

  return (
    <div className="mb-8 space-y-6">
      {isPastDue ? (
        <div
          className="rounded-2xl border border-amber-400/30 bg-gradient-to-r from-amber-500/15 via-amber-400/10 to-orange-500/10 p-5"
          role="status"
        >
          <p className="text-sm font-medium text-on-surface">
            {t("billing.pastDueAlertBody")}
          </p>
          <p className="mt-1 text-sm text-on-surface-variant">
            {graceExpired
              ? t("billing.pastDueAlertExpiredDetail", { plan: pastDuePlanLabel })
              : t("billing.pastDueAlertDetail", {
                  plan: pastDuePlanLabel,
                  days: daysRemaining,
                })}
          </p>
          <button
            type="button"
            disabled={portalBusy}
            onClick={onManagePortal}
            className="mt-4 inline-flex items-center gap-2 rounded-xl bg-amber-400 px-4 py-2.5 text-sm font-bold text-black shadow-md shadow-amber-400/20 hover:brightness-105 disabled:opacity-60"
          >
            {portalBusy ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <ExternalLink className="h-4 w-4" />
            )}
            {t("billing.pastDueUpdatePayment")}
          </button>
        </div>
      ) : null}
      <div className="rounded-2xl border border-outline-variant/15 bg-surface-container-low p-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-primary">
              {t("billing.currentPlan")}
            </p>
            <p className="mt-1 text-2xl font-black text-on-surface">{planLabel}</p>
            <p className="text-sm capitalize text-on-surface-variant">
              {t("billing.statusPrefix")} {billingStatusLabel(usage.billing_status)}
              {usage.billing_interval ? ` · ${usage.billing_interval}ly` : ""}
            </p>
          </div>
          {usage.billing_status !== "none" &&
          (usage.plan_id !== "free" || isPastDue) ? (
            <button
              type="button"
              disabled={portalBusy}
              onClick={onManagePortal}
              className="inline-flex items-center gap-2 rounded-xl border border-outline-variant/30 bg-surface-container px-4 py-2.5 text-sm font-bold text-on-surface hover:bg-surface-container-high disabled:opacity-60"
            >
              {portalBusy ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <ExternalLink className="h-4 w-4" />
              )}
              {isPastDue
                ? t("billing.pastDueUpdatePayment")
                : t("billing.manageSubscription")}
            </button>
          ) : null}
        </div>

        {plan ? (
          <div className="mt-4 rounded-xl border border-outline-variant/10 bg-surface-container/50 p-4">
            <p className="mb-1 text-sm font-semibold text-on-surface">
              {t("billing.whatsIncludedIn", { plan: plan.display_name })}
            </p>
            <p className="text-sm text-on-surface-variant">{plan.tagline}</p>
            <BillingPlanDetailsBlock plan={plan} />
          </div>
        ) : null}
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <UsageMeter
          label={t("billing.postsThisPeriod")}
          used={usage.used_this_period.posts}
          limit={usage.limits.posts_per_month}
        />
        <UsageMeter
          label={t("settings.aiUsageQuotaAiCredits")}
          used={usage.used_this_period.ai_credits}
          limit={usage.limits.ai_credits_per_month}
        />
        <UsageMeter
          label={t("settings.aiUsageQuotaScheduledPosts")}
          used={usage.used_this_period.scheduled_posts}
          limit={usage.limits.scheduled_posts_per_month}
        />
      </div>

      <p className="text-xs text-on-surface-variant">
        {t("settings.aiUsageQuotaConnectedAccounts", {
          connected: String(usage.usage_counts.connected_accounts),
          limit: String(usage.limits.max_connected_accounts),
          workspacesOwned: String(usage.usage_counts.workspaces_owned),
          workspaceLimit: String(usage.limits.max_workspaces),
        })}
      </p>
    </div>
  );
}
