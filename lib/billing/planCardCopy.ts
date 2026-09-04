import type { BillingPlanPublic } from "./billingApi";

export const UNLIMITED_PLAN_LIMIT = 999_999;

export function isUnlimitedPlanLimit(value: number): boolean {
  return value >= UNLIMITED_PLAN_LIMIT;
}

export function formatPlanLimitValue(n: number): string {
  if (n === 0) return "—";
  if (isUnlimitedPlanLimit(n)) return "Unlimited";
  return n.toLocaleString();
}

export const PLAN_CARD_HIGHLIGHTS: Record<string, string[]> = {
  free: [
    "1 OAuth platform",
    "5 posts / mo (publish + schedule)",
    "5 drafts · 1 AI Watcher post",
    "500 AI credits · inbox & DM agents",
  ],
  starter: [
    "3 workspaces · 12 accounts",
    "Drafts, schedule & inbox",
    "Piva AI agent · MCP integrations",
    "WhatsApp & DM agents",
    "3,000 AI credits / mo",
    "5 team members",
  ],
  pro: [
    "8 workspaces · unlimited accounts",
    "WhatsApp & DM agents",
    "GPT, MCP & API keys",
    "Personas, AI Watcher & leads",
    "10,000 AI credits / mo",
  ],
};

export function planPriceLabel(
  plan: BillingPlanPublic,
  interval: "month" | "year",
): { main: string; sub: string } {
  if (plan.plan_id === "free") {
    return { main: "$0", sub: "forever" };
  }
  if (interval === "year") {
    const perMonth = Math.round(plan.price_yearly_usd / 12);
    return {
      main: `$${plan.price_yearly_usd}`,
      sub: `/ year (~$${perMonth}/mo)`,
    };
  }
  return { main: `$${plan.price_monthly_usd}`, sub: "/ month" };
}

export function isPaidPlan(planId: string): planId is "starter" | "pro" {
  return planId === "starter" || planId === "pro";
}

const PLAN_TIER: Record<string, number> = {
  free: 0,
  starter: 1,
  pro: 2,
  agency: 2,
};

export function comparePlanTier(currentPlanId: string, targetPlanId: string): number {
  return (PLAN_TIER[targetPlanId] ?? 0) - (PLAN_TIER[currentPlanId] ?? 0);
}

export function planDisplayName(planId: string): string {
  if (!planId) {
    return "—";
  }
  if (planId === "agency") {
    return "Pro";
  }
  return planId.charAt(0).toUpperCase() + planId.slice(1);
}

export const BILLING_EXPECTED_PLAN_KEY = "postsiva_billing_expected_plan";
export const BILLING_PREVIOUS_PLAN_KEY = "postsiva_billing_previous_plan";
export const BILLING_TRANSACTION_KEY = "postsiva_billing_transaction_id";
