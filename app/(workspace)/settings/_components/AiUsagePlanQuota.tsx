"use client";

import { OpenBillingButton } from "@/components/billing/OpenBillingButton";
import type { ReactElement } from "react";

import type { BillingUsage } from "@/lib/billing/billingApi";
import { planDisplayName } from "@/lib/billing/planCardCopy";
import { useTranslations } from "@/lib/i18n/WorkspaceLocaleProvider";

function formatLimit(n: number): string {
  return n === 0 ? "—" : n.toLocaleString();
}

function formatPeriod(start: string, end: string): string | null {
  try {
    const opts: Intl.DateTimeFormatOptions = { dateStyle: "medium" };
    const s = new Date(start).toLocaleDateString(undefined, opts);
    const e = new Date(end).toLocaleDateString(undefined, opts);
    return `${s} – ${e}`;
  } catch {
    return null;
  }
}

function billingStatusLabel(status: string): string {
  return status === "none" ? "No active subscription" : status.replace(/_/g, " ");
}

function PlanUsageMeter({
  label,
  used,
  limit,
  remainingLabel,
  notIncludedLabel,
}: {
  label: string;
  used: number;
  limit: number;
  remainingLabel: string;
  notIncludedLabel: string;
}): ReactElement {
  const hasLimit = limit > 0;
  const pct = hasLimit ? Math.min(100, Math.round((used / limit) * 100)) : 0;
  const remaining = hasLimit ? Math.max(0, limit - used) : null;

  return (
    <div className="rounded-xl border border-outline-variant/15 bg-surface-container-low p-4">
      <div className="flex items-center justify-between gap-2 text-sm">
        <span className="font-medium text-on-surface">{label}</span>
        <span className="shrink-0 tabular-nums text-on-surface-variant">
          {used.toLocaleString()} / {formatLimit(limit)}
        </span>
      </div>
      {hasLimit ? (
        <div className="mt-2 h-2 overflow-hidden rounded-full bg-surface-container-high">
          <div
            className="h-full rounded-full bg-primary transition-all"
            style={{ width: `${pct}%` }}
          />
        </div>
      ) : (
        <div className="mt-2 h-2 rounded-full bg-surface-container-high/60" />
      )}
      {remaining !== null ? (
        <p className="mt-2 text-xs text-on-surface-variant">{remainingLabel}</p>
      ) : (
        <p className="mt-2 text-xs text-on-surface-variant">{notIncludedLabel}</p>
      )}
    </div>
  );
}

type AiUsagePlanQuotaProps = {
  usage: BillingUsage;
};

export function AiUsagePlanQuota({ usage }: AiUsagePlanQuotaProps): ReactElement {
  const { t } = useTranslations();
  const planLabel = planDisplayName(usage.plan_id);
  const periodLabel =
    usage.period_start && usage.period_end
      ? formatPeriod(usage.period_start, usage.period_end)
      : null;
  const statusLabel = billingStatusLabel(usage.billing_status);

  return (
    <section className="mb-10 rounded-2xl border border-outline-variant/15 bg-surface-container-low/60 p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-primary">
            {t("billing.currentPlan")}
          </p>
          <p className="mt-1 text-xl font-black text-on-surface">{planLabel}</p>
          <p className="text-sm capitalize text-on-surface-variant">
            {statusLabel}
            {usage.billing_interval ? ` · ${usage.billing_interval}ly` : ""}
          </p>
          {periodLabel ? (
            <p className="mt-1 text-xs text-on-surface-variant">
              {t("settings.aiUsageQuotaBillingPeriod", { period: periodLabel })}
            </p>
          ) : null}
        </div>
        <OpenBillingButton
          className="rounded-xl border border-outline-variant/25 bg-surface-container px-3 py-2 text-xs font-bold text-on-surface transition-colors hover:bg-surface-container-high"
        >
          {t("settings.aiUsageQuotaChangePlan")}
        </OpenBillingButton>
      </div>

      <div className="mt-5 grid gap-4 sm:grid-cols-3">
        <PlanUsageMeter
          label={t("settings.aiUsageQuotaPostsPublish")}
          used={usage.used_this_period.posts}
          limit={usage.limits.posts_per_month}
          remainingLabel={t("settings.aiUsageQuotaRemaining", {
            count: Math.max(0, usage.limits.posts_per_month - usage.used_this_period.posts).toLocaleString(),
          })}
          notIncludedLabel={t("settings.aiUsageQuotaNotIncluded")}
        />
        <PlanUsageMeter
          label={t("settings.aiUsageQuotaAiCredits")}
          used={usage.used_this_period.ai_credits}
          limit={usage.limits.ai_credits_per_month}
          remainingLabel={t("settings.aiUsageQuotaRemaining", {
            count: Math.max(0, usage.limits.ai_credits_per_month - usage.used_this_period.ai_credits).toLocaleString(),
          })}
          notIncludedLabel={t("settings.aiUsageQuotaNotIncluded")}
        />
        <PlanUsageMeter
          label={t("settings.aiUsageQuotaScheduledPosts")}
          used={usage.used_this_period.scheduled_posts}
          limit={usage.limits.scheduled_posts_per_month}
          remainingLabel={t("settings.aiUsageQuotaRemaining", {
            count: Math.max(
              0,
              usage.limits.scheduled_posts_per_month - usage.used_this_period.scheduled_posts,
            ).toLocaleString(),
          })}
          notIncludedLabel={t("settings.aiUsageQuotaNotIncluded")}
        />
      </div>

      <p className="mt-4 text-xs text-on-surface-variant">
        {t("settings.aiUsageQuotaConnectedAccounts", {
          connected: usage.usage_counts.connected_accounts.toLocaleString(),
          limit: formatLimit(usage.limits.max_connected_accounts),
          workspacesOwned: usage.usage_counts.workspaces_owned.toLocaleString(),
          workspaceLimit: formatLimit(usage.limits.max_workspaces),
        })}
        {usage.limits.max_team_members_per_workspace > 0
          ? t("settings.aiUsageQuotaTeamMembers", {
              count: usage.limits.max_team_members_per_workspace.toLocaleString(),
            })
          : ""}
      </p>
    </section>
  );
}
