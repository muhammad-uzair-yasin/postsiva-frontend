"use client";

import { Fragment } from "react";

import {
  COMPARE_UNLIMITED,
  formatCompareCell,
  PRICING_COMPARE_ROWS,
  type CompareCell,
  type CompareRowDef,
} from "@/lib/billing/compareTableData";
import type { BillingPlanPublic } from "@/lib/billing/billingApi";
import { isUnlimitedPlanLimit } from "@/lib/billing/planCardCopy";
import { usePublicTranslations } from "@/lib/i18n/PublicLocaleProvider";
import { cn } from "@/lib/cn";

type LightPricingCompareTableProps = {
  readonly plans: readonly BillingPlanPublic[];
};

function planById(plans: readonly BillingPlanPublic[], id: string): BillingPlanPublic | null {
  return plans.find((plan) => plan.plan_id === id) ?? null;
}

function priceCell(plan: BillingPlanPublic | null, field: "price_monthly_usd" | "price_yearly_usd"): string {
  if (!plan) return "—";
  return `$${plan[field]}`;
}

function limitCell(plan: BillingPlanPublic | null, key: keyof BillingPlanPublic["limits"]): CompareCell {
  if (!plan) return "—";
  const value = plan.limits[key];
  if (typeof value !== "number") return "—";
  if (value === 0) return "—";
  if (isUnlimitedPlanLimit(value)) return COMPARE_UNLIMITED;
  return value;
}

function featureCell(plan: BillingPlanPublic | null, key: string): boolean {
  return plan?.features[key] === true;
}

function apiBackedRows(plans: readonly BillingPlanPublic[]): CompareRowDef[] {
  const free = planById(plans, "free");
  const starter = planById(plans, "starter");
  const pro = planById(plans, "pro");
  return PRICING_COMPARE_ROWS.map((row) => {
    switch (row.labelKey) {
      case "compareRowMonthly":
        return {
          ...row,
          free: priceCell(free, "price_monthly_usd"),
          starter: priceCell(starter, "price_monthly_usd"),
          pro: priceCell(pro, "price_monthly_usd"),
        };
      case "compareRowYearly":
        return {
          ...row,
          free: priceCell(free, "price_yearly_usd"),
          starter: priceCell(starter, "price_yearly_usd"),
          pro: priceCell(pro, "price_yearly_usd"),
        };
      case "compareRowWorkspaces":
        return {
          ...row,
          free: limitCell(free, "max_workspaces"),
          starter: limitCell(starter, "max_workspaces"),
          pro: limitCell(pro, "max_workspaces"),
        };
      case "compareRowAccounts":
        return {
          ...row,
          free: limitCell(free, "max_connected_accounts"),
          starter: limitCell(starter, "max_connected_accounts"),
          pro: limitCell(pro, "max_connected_accounts"),
        };
      case "compareRowTeam":
        return {
          ...row,
          free: limitCell(free, "max_team_members_per_workspace"),
          starter: limitCell(starter, "max_team_members_per_workspace"),
          pro: limitCell(pro, "max_team_members_per_workspace"),
        };
      case "compareRowPosts":
        return {
          ...row,
          free: limitCell(free, "posts_per_month"),
          starter: limitCell(starter, "posts_per_month"),
          pro: limitCell(pro, "posts_per_month"),
        };
      case "compareRowAiCredits":
        return {
          ...row,
          free: limitCell(free, "ai_credits_per_month"),
          starter: limitCell(starter, "ai_credits_per_month"),
          pro: limitCell(pro, "ai_credits_per_month"),
        };
      case "compareRowScheduled":
        return {
          ...row,
          free: limitCell(free, "scheduled_posts_per_month"),
          starter: limitCell(starter, "scheduled_posts_per_month"),
          pro: limitCell(pro, "scheduled_posts_per_month"),
        };
      case "compareRowPublishNow":
        return {
          ...row,
          free: featureCell(free, "publish_enabled"),
          starter: featureCell(starter, "publish_enabled"),
          pro: featureCell(pro, "publish_enabled"),
        };
      case "compareRowDrafts":
        return { ...row, free: featureCell(free, "drafts_enabled"), starter: featureCell(starter, "drafts_enabled"), pro: featureCell(pro, "drafts_enabled") };
      case "compareRowScheduling":
        return { ...row, free: featureCell(free, "scheduling_enabled"), starter: featureCell(starter, "scheduling_enabled"), pro: featureCell(pro, "scheduling_enabled") };
      case "compareRowChrome":
        return { ...row, free: featureCell(free, "extension_enabled"), starter: featureCell(starter, "extension_enabled"), pro: featureCell(pro, "extension_enabled") };
      case "compareRowAiComposer":
        return { ...row, free: featureCell(free, "ai_composer_enabled"), starter: featureCell(starter, "ai_composer_enabled"), pro: featureCell(pro, "ai_composer_enabled") };
      case "compareRowPiva":
        return { ...row, free: featureCell(free, "piva_agent_enabled"), starter: featureCell(starter, "piva_agent_enabled"), pro: featureCell(pro, "piva_agent_enabled") };
      case "compareRowPersonas":
        return { ...row, free: featureCell(free, "personas_enabled"), starter: featureCell(starter, "personas_enabled"), pro: featureCell(pro, "personas_enabled") };
      case "compareRowCommentAi":
        return { ...row, free: featureCell(free, "auto_replier_enabled"), starter: featureCell(starter, "auto_replier_enabled"), pro: featureCell(pro, "auto_replier_enabled") };
      case "compareRowAiWatcher":
        return { ...row, free: featureCell(free, "ai_watcher_enabled"), starter: featureCell(starter, "ai_watcher_enabled"), pro: featureCell(pro, "ai_watcher_enabled") };
      case "compareRowUnifiedInbox":
        return { ...row, free: featureCell(free, "inbox_enabled"), starter: featureCell(starter, "inbox_enabled"), pro: featureCell(pro, "inbox_enabled") };
      case "compareRowWhatsapp":
        return { ...row, free: featureCell(free, "whatsapp_agent_enabled"), starter: featureCell(starter, "whatsapp_agent_enabled"), pro: featureCell(pro, "whatsapp_agent_enabled") };
      case "compareRowDm":
        return {
          ...row,
          free: featureCell(free, "instagram_dm_enabled") || featureCell(free, "facebook_dm_enabled"),
          starter: featureCell(starter, "instagram_dm_enabled") || featureCell(starter, "facebook_dm_enabled"),
          pro: featureCell(pro, "instagram_dm_enabled") || featureCell(pro, "facebook_dm_enabled"),
        };
      case "compareRowGptMcp":
        return {
          ...row,
          free: featureCell(free, "gpt_app_enabled") || featureCell(free, "mcp_enabled"),
          starter: featureCell(starter, "gpt_app_enabled") || featureCell(starter, "mcp_enabled"),
          pro: featureCell(pro, "gpt_app_enabled") || featureCell(pro, "mcp_enabled"),
        };
      case "compareRowAnalytics":
        return { ...row, free: featureCell(free, "analytics_enabled"), starter: featureCell(starter, "analytics_enabled"), pro: featureCell(pro, "analytics_enabled") };
      case "compareRowEmailSupport":
        return { ...row, free: featureCell(free, "support_enabled"), starter: featureCell(starter, "support_enabled"), pro: featureCell(pro, "support_enabled") };
      default:
        return row;
    }
  });
}

export function LightPricingCompareTable({
  plans,
}: LightPricingCompareTableProps): React.ReactElement {
  const { t } = usePublicTranslations();
  const unlimitedLabel = t("marketing.compareUnlimited");
  const includedLabel = t("marketing.compareCellIncluded");
  const rows = apiBackedRows(plans);

  const columns = [
    { key: "free" as const, label: t("marketing.compareColumnFree"), highlight: false },
    { key: "starter" as const, label: t("marketing.compareColumnStarter"), highlight: true },
    { key: "pro" as const, label: t("marketing.compareColumnPro"), highlight: false },
  ];

  function Cell({
    value,
    highlight,
  }: {
    value: CompareCell;
    highlight: boolean;
  }): React.ReactElement {
    const included = value === true;
    const excluded = value === false;
    return (
      <td
        className={cn(
          "px-6 py-4 text-center text-sm",
          highlight ? "bg-[#EFF6FF]" : undefined,
        )}
      >
        {included ? (
          <span
            className={cn(
              "material-symbols-outlined inline-block",
              highlight ? "text-[#0058bc]" : "text-[#4B5563]",
            )}
            aria-label={includedLabel}
          >
            check
          </span>
        ) : excluded ? (
          <span className="material-symbols-outlined text-[#CBD5E1]">remove</span>
        ) : (
          <span className={cn("font-medium", highlight ? "text-[#111827]" : "text-[#4B5563]")}>
            {formatCompareCell(value, unlimitedLabel)}
          </span>
        )}
      </td>
    );
  }

  return (
    <section className="mx-auto mb-24 max-w-5xl lg:mb-32">
      <div className="mb-12 text-center">
        <h2 className="mb-4 font-[family-name:var(--font-headline)] text-2xl font-semibold text-[#111827] sm:text-[2rem] sm:leading-10">
          Full plan comparison
        </h2>
        <p className="text-base text-[#4B5563]">
          A detailed breakdown of what&apos;s included in every tier.
        </p>
      </div>

      <div className="overflow-hidden rounded-2xl border border-[#E5E7EB] bg-white shadow-[0_4px_20px_rgb(0,0,0,0.03)]">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] border-collapse text-left">
            <thead>
              <tr className="border-b border-[#E5E7EB] bg-white">
                <th className="w-1/4 px-6 py-6 font-mono text-xs font-semibold uppercase tracking-wider text-[#4B5563]">
                  {t("marketing.compareColumnFeature")}
                </th>
                {columns.map((col) => (
                  <th
                    key={col.key}
                    className={cn(
                      "w-1/4 px-6 py-6 text-center text-xl font-semibold",
                      col.highlight ? "bg-[#EFF6FF] text-[#0058bc]" : "text-[#111827]",
                    )}
                  >
                    {col.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="text-sm">
              {rows.map((row, index) => (
                <Fragment key={`${row.labelKey}-${index}`}>
                  {row.sectionKey ? (
                    <tr className="bg-[#F9FAFB]">
                      <td
                        colSpan={4}
                        className="border-y border-[#E5E7EB] bg-[#F9FAFB] px-6 py-3 font-mono text-xs uppercase tracking-widest text-[#4B5563]"
                      >
                        {t(`marketing.${row.sectionKey}`)}
                      </td>
                    </tr>
                  ) : null}
                  <tr className="border-b border-[#E5E7EB]/70 transition-colors last:border-0 hover:bg-[#F9FAFB]/60">
                    <td className="px-6 py-4 font-medium text-[#111827]">
                      {t(`marketing.${row.labelKey}`)}
                    </td>
                    <Cell value={row.free} highlight={false} />
                    <Cell value={row.starter} highlight />
                    <Cell value={row.pro} highlight={false} />
                  </tr>
                </Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
