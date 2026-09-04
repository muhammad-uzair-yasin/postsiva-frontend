/** Human-readable labels for billing feature flags. */
export const BILLING_FEATURE_LABELS: Record<string, string> = {
  publish_enabled: "Publish now (composer)",
  drafts_enabled: "Drafts",
  scheduling_enabled: "Scheduling",
  inbox_enabled: "Inbox",
  analytics_enabled: "Analytics",
  ai_composer_enabled: "AI Composer (ideas, images, video & edit)",
  personas_enabled: "Brand Personas",
  extension_enabled: "Chrome Extension",
  whatsapp_agent_enabled: "WhatsApp Agent",
  instagram_dm_enabled: "Instagram DM",
  facebook_dm_enabled: "Facebook DM",
  gpt_app_enabled: "GPT Integration",
  mcp_enabled: "MCP Server",
  api_keys_enabled: "API Keys",
  auto_replier_enabled: "AI Comment Replier",
  ai_watcher_enabled: "AI Watcher",
  piva_agent_enabled: "Piva AI Agent",
  lead_detection_enabled: "Lead Detection",
  bulk_scheduling_enabled: "Bulk scheduling",
  support_enabled: "Email support",
};

export function billingFeatureLabel(feature: string): string {
  return BILLING_FEATURE_LABELS[feature] ?? feature.replace(/_/g, " ");
}

export function isBillingPlanError(status: number, body: unknown): boolean {
  if (status !== 402 && status !== 403) {
    return false;
  }
  if (typeof body !== "object" || body === null) {
    return false;
  }
  const detail = (body as { detail?: unknown }).detail;
  if (typeof detail === "object" && detail !== null) {
    const err = (detail as { error?: string }).error;
    return (
      err === "plan_required" ||
      err === "insufficient_credits" ||
      err === "insufficient_ai_credits" ||
      err === "connected_account_limit" ||
      err === "workspace_limit" ||
      err === "team_member_limit"
    );
  }
  return false;
}

export interface BillingPlanErrorDetail {
  error:
    | "plan_required"
    | "insufficient_credits"
    | "insufficient_ai_credits"
    | "connected_account_limit"
    | "workspace_limit"
    | "team_member_limit";
  feature?: string;
  credit_type?: string;
  remaining?: number;
  required?: number;
  available?: number;
  used?: number;
  limit?: number;
  message?: string;
}

export class BillingPlanError extends Error {
  readonly status: number;
  readonly detail: BillingPlanErrorDetail;

  constructor(status: number, detail: BillingPlanErrorDetail) {
    const defaultMsg =
      detail.error === "insufficient_ai_credits"
        ? "You've run out of AI credits. Please upgrade your plan to continue."
        : detail.error;
    super(detail.message ?? defaultMsg);
    this.name = "BillingPlanError";
    this.status = status;
    this.detail = detail;
  }
}

export function parseBillingPlanError(status: number, body: unknown): BillingPlanError | null {
  if (!isBillingPlanError(status, body)) {
    return null;
  }
  const detail = (body as { detail?: BillingPlanErrorDetail }).detail;
  if (!detail || typeof detail !== "object") {
    return null;
  }
  return new BillingPlanError(status, detail);
}

export function billingErrorToPlanLimitKind(
  error: BillingPlanErrorDetail["error"],
): "connected_accounts" | "workspaces" | "team_members" | null {
  switch (error) {
    case "connected_account_limit":
      return "connected_accounts";
    case "workspace_limit":
      return "workspaces";
    case "team_member_limit":
      return "team_members";
    default:
      return null;
  }
}
