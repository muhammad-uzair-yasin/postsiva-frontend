/**
 * Admin plan grant API — grant/cancel Starter or Pro for a user.
 * Pure helpers + types; network via adminSend/adminGet in hooks.
 */

export type GrantablePlanId = "starter" | "pro";

export interface AdminUserPlanSummary {
  effective_plan_id: string;
  admin_grant_active: boolean;
  admin_grant_expires_at?: string | null;
  granted_by_email?: string | null;
  months_granted?: number | null;
}

export interface AdminPlanGrantStatus {
  active: boolean;
  plan_id: string | null;
  billing_status: string;
  expires_at: string | null;
  months_granted: number | null;
  granted_at: string | null;
  granted_by_user_id: string | null;
  granted_by_email: string | null;
}

export function buildPlanGrantPath(userId: string): string {
  return `/admin/api/users/${encodeURIComponent(userId)}/plan-grant`;
}

export function planDisplayLabel(
  plan?: AdminUserPlanSummary | null,
): string {
  if (!plan) return "—";
  const id = (plan.effective_plan_id || "free").toLowerCase();
  const name = id === "pro" ? "Pro" : id === "starter" ? "Starter" : "Free";
  if (plan.admin_grant_active) {
    return `${name} (admin)`;
  }
  return name;
}

export function formatGrantExpiry(iso: string | null | undefined): string {
  if (!iso) return "—";
  const t = Date.parse(iso);
  if (Number.isNaN(t)) return "—";
  return new Date(t).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });
}

export const GRANTABLE_PLANS: { id: GrantablePlanId; label: string }[] = [
  { id: "starter", label: "Starter" },
  { id: "pro", label: "Pro" },
];

export const GRANT_MONTH_PRESETS = [1, 2, 3, 6, 12];
