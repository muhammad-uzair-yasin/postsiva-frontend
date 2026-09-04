import type { BillingPlanLimits, BillingPlanPublic } from "@/lib/billing/billingApi";
import { billingFeatureLabel } from "@/lib/billing/billingErrors";
import { formatPlanLimitValue } from "@/lib/billing/planCardCopy";

/** Omitted from plan cards — bundled into `ai_composer_enabled`. */
export const HIDDEN_PLAN_FEATURE_KEYS = new Set(["ai_image_editing_enabled"]);

/** Display order for plan feature flags (matches backend `PlanFeatures`). */
export const PLAN_FEATURE_ORDER = [
  "publish_enabled",
  "drafts_enabled",
  "scheduling_enabled",
  "extension_enabled",
  "inbox_enabled",
  "ai_composer_enabled",
  "personas_enabled",
  "analytics_enabled",
  "support_enabled",
  "whatsapp_agent_enabled",
  "instagram_dm_enabled",
  "facebook_dm_enabled",
  "gpt_app_enabled",
  "mcp_enabled",
  "api_keys_enabled",
  "auto_replier_enabled",
  "piva_agent_enabled",
  "lead_detection_enabled",
  "ai_watcher_enabled",
  "bulk_scheduling_enabled",
] as const;

export type PlanLimitRow = { label: string; value: string };

export function formatPlanLimitRows(limits: BillingPlanLimits): PlanLimitRow[] {
  const rows: PlanLimitRow[] = [
    { label: "Workspaces", value: formatPlanLimitValue(limits.max_workspaces) },
    { label: "Connected accounts", value: formatPlanLimitValue(limits.max_connected_accounts) },
    {
      label: "Team members / workspace",
      value: formatPlanLimitValue(limits.max_team_members_per_workspace),
    },
  ];
  if (limits.shared_posts_quota) {
    rows.push({
      label: "Posts / month (publish + schedule)",
      value: formatPlanLimitValue(limits.posts_per_month),
    });
  } else {
    rows.push({
      label: "Posts / month (publish now)",
      value: formatPlanLimitValue(limits.posts_per_month),
    });
    rows.push({
      label: "Scheduled posts / month",
      value: formatPlanLimitValue(limits.scheduled_posts_per_month),
    });
  }
  rows.push({
    label: "AI credits / month",
    value: formatPlanLimitValue(limits.ai_credits_per_month),
  });
  if (limits.max_drafts_per_workspace != null && limits.max_drafts_per_workspace < 999_999) {
    rows.push({
      label: "Drafts / workspace",
      value: formatPlanLimitValue(limits.max_drafts_per_workspace),
    });
  }
  if (limits.max_ai_watcher_enabled != null && limits.max_ai_watcher_enabled < 999_999) {
    rows.push({
      label: "AI Watcher posts",
      value: formatPlanLimitValue(limits.max_ai_watcher_enabled),
    });
  }
  return rows;
}

export type PlanFeatureRow = { key: string; label: string; included: boolean };

export function planFeatureRows(plan: BillingPlanPublic): PlanFeatureRow[] {
  return PLAN_FEATURE_ORDER.filter((key) => !HIDDEN_PLAN_FEATURE_KEYS.has(key)).map((key) => ({
    key,
    label: billingFeatureLabel(key),
    included: Boolean(plan.features[key]),
  }));
}
