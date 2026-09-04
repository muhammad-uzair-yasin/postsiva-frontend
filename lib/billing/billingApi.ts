import { getApiBaseUrl } from "@/lib/api/config";
import { fetchWithAccessTokenRetry } from "@/lib/api/fetchWithAccessTokenRetry";
import { parseApiErrorBody } from "@/lib/api/parseApiError";

export type BillingInterval = "month" | "year";
export type PaidPlanId = "starter" | "pro";

export interface BillingPlanLimits {
  max_workspaces: number;
  max_connected_accounts: number;
  max_team_members_per_workspace: number;
  posts_per_month: number;
  ai_credits_per_month: number;
  scheduled_posts_per_month: number;
  shared_posts_quota?: boolean;
  connected_account_mode?: string;
  max_ai_watcher_enabled?: number;
  max_drafts_per_workspace?: number;
}

export interface BillingPlanPublic {
  plan_id: string;
  display_name: string;
  price_monthly_usd: number;
  price_yearly_usd: number;
  yearly_savings_percent: number;
  tagline: string;
  limits: BillingPlanLimits;
  features: Record<string, boolean>;
}

export interface BillingPlansResponse {
  plans: BillingPlanPublic[];
  trial: { plan_id: string; days: number; card_required: boolean };
  yearly_savings_percent: number;
}

export interface BillingUsage {
  owner_user_id: string;
  plan_id: string;
  billing_status: string;
  billing_interval: string | null;
  current_period_end: string | null;
  trial_end: string | null;
  past_due_since?: string | null;
  past_due_grace_days?: number;
  past_due_ends_at?: string | null;
  past_due_grace_expired?: boolean;
  past_due_days_remaining?: number | null;
  limits: BillingPlanLimits;
  remaining: {
    posts: number;
    ai_credits: number;
    scheduled_posts: number;
  };
  used_this_period: {
    posts: number;
    ai_credits: number;
    scheduled_posts: number;
  };
  usage_counts: {
    connected_accounts: number;
    workspaces_owned: number;
  };
  features: Record<string, boolean>;
  period_start: string;
  period_end: string;
}

export interface PaddleClientConfig {
  client_token: string;
  environment: string;
  success_url: string;
}

function workspaceHeaders(token: string, workspaceId?: string): HeadersInit {
  const h: Record<string, string> = {
    Authorization: `Bearer ${token}`,
    Accept: "application/json",
  };
  if (workspaceId?.trim()) {
    h["X-Workspace-Id"] = workspaceId.trim();
  }
  return h;
}

export async function fetchPaddleClientConfig(): Promise<PaddleClientConfig> {
  const base = getApiBaseUrl();
  const res = await fetch(`${base}/billing/paddle-config`, {
    headers: { Accept: "application/json" },
    cache: "no-store",
  });
  if (!res.ok) {
    throw new Error(await parseApiErrorBody(res));
  }
  return (await res.json()) as PaddleClientConfig;
}

export async function fetchBillingPlans(): Promise<BillingPlansResponse> {
  const base = getApiBaseUrl();
  const res = await fetch(`${base}/billing/plans`, {
    headers: { Accept: "application/json" },
    cache: "no-store",
  });
  if (!res.ok) {
    throw new Error(await parseApiErrorBody(res));
  }
  return (await res.json()) as BillingPlansResponse;
}

export async function fetchBillingUsage(
  accessToken: string,
  workspaceId?: string,
): Promise<BillingUsage> {
  const base = getApiBaseUrl();
  const res = await fetchWithAccessTokenRetry(
    `${base}/billing/usage`,
    accessToken,
    (t) => workspaceHeaders(t, workspaceId),
    { method: "GET" },
  );
  if (!res.ok) {
    throw new Error(await parseApiErrorBody(res));
  }
  return (await res.json()) as BillingUsage;
}

export async function startBillingCheckout(
  accessToken: string,
  planId: PaidPlanId,
  interval: BillingInterval,
): Promise<{ checkout_url: string; checkout_ref: string; transaction_id: string }> {
  const base = getApiBaseUrl();
  const res = await fetchWithAccessTokenRetry(
    `${base}/billing/checkout`,
    accessToken,
    (t) => workspaceHeaders(t),
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ plan_id: planId, interval }),
    },
  );
  if (!res.ok) {
    throw new Error(await parseApiErrorBody(res));
  }
  return (await res.json()) as {
    checkout_url: string;
    checkout_ref: string;
    transaction_id: string;
  };
}

export interface BillingCheckoutConfirmResult {
  status: string;
  plan_id?: string;
  billing_status?: string;
  message?: string;
}

export async function confirmBillingCheckout(
  accessToken: string,
  transactionId?: string,
): Promise<BillingCheckoutConfirmResult> {
  const base = getApiBaseUrl();
  const res = await fetchWithAccessTokenRetry(
    `${base}/billing/checkout/confirm`,
    accessToken,
    (t) => workspaceHeaders(t),
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ transaction_id: transactionId ?? null }),
    },
  );
  if (!res.ok) {
    throw new Error(await parseApiErrorBody(res));
  }
  return (await res.json()) as BillingCheckoutConfirmResult;
}

export interface BillingPlanChangeResult {
  action: string;
  plan_id?: string;
  billing_status?: string;
  message?: string;
  checkout_ref?: string;
  checkout_url?: string;
  transaction_id?: string;
  effective_from?: string;
}

export async function changeBillingPlan(
  accessToken: string,
  planId: PaidPlanId,
  interval: BillingInterval,
): Promise<BillingPlanChangeResult> {
  const base = getApiBaseUrl();
  const res = await fetchWithAccessTokenRetry(
    `${base}/billing/change-plan`,
    accessToken,
    (t) => workspaceHeaders(t),
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ plan_id: planId, interval }),
    },
  );
  if (!res.ok) {
    throw new Error(await parseApiErrorBody(res));
  }
  return (await res.json()) as BillingPlanChangeResult;
}

export async function cancelBillingSubscription(
  accessToken: string,
  effectiveFrom: "immediately" | "next_billing_period" = "next_billing_period",
): Promise<BillingPlanChangeResult> {
  const base = getApiBaseUrl();
  const res = await fetchWithAccessTokenRetry(
    `${base}/billing/cancel`,
    accessToken,
    (t) => workspaceHeaders(t),
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ effective_from: effectiveFrom }),
    },
  );
  if (!res.ok) {
    throw new Error(await parseApiErrorBody(res));
  }
  return (await res.json()) as BillingPlanChangeResult;
}

export async function openBillingPortal(
  accessToken: string,
): Promise<{ portal_url: string }> {
  const base = getApiBaseUrl();
  const res = await fetchWithAccessTokenRetry(
    `${base}/billing/portal`,
    accessToken,
    (t) => workspaceHeaders(t),
    { method: "POST" },
  );
  if (!res.ok) {
    throw new Error(await parseApiErrorBody(res));
  }
  return (await res.json()) as { portal_url: string };
}
