/** Admin paid-users API types and display helpers. */

export type PaidUserFilter = "all" | "new" | "admin" | "paddle" | "referral" | "at_risk";

export interface AdminPaidUserAdminGrant {
  active: boolean;
  expires_at: string | null;
  months_granted: number | null;
  granted_at: string | null;
  granted_by_email: string | null;
}

export interface PaidUserRow {
  user_id: string;
  email: string;
  username: string;
  full_name: string;
  is_active: boolean;
  user_created_at: string | null;
  effective_plan_id: string;
  billing_source: string;
  billing_status: string;
  billing_interval: string | null;
  current_period_end: string | null;
  paddle_subscription_id: string | null;
  paddle_customer_id: string | null;
  first_paid_at: string | null;
  admin_grant: AdminPaidUserAdminGrant;
  is_at_risk: boolean;
  at_risk_reason: string | null;
  renewal_note: string | null;
}

export interface PaymentHistoryEntry {
  id: string;
  event_type: string;
  created_at: string;
  payload: Record<string, unknown> | null;
  actor_user_id: string | null;
}

export interface PaidUserDetail extends PaidUserRow {
  payment_history: PaymentHistoryEntry[];
}

export interface PaidUsersListResponse {
  items: PaidUserRow[];
  total: number;
  filter: PaidUserFilter;
  limit: number;
  offset: number;
}

export const PAID_USER_FILTERS: { id: PaidUserFilter; label: string }[] = [
  { id: "all", label: "All paid" },
  { id: "new", label: "New (30d)" },
  { id: "paddle", label: "Paddle payment" },
  { id: "admin", label: "Admin activated" },
  { id: "referral", label: "Referral Pro" },
  { id: "at_risk", label: "At risk" },
];

export function paidUserDisplayName(row: PaidUserRow): string {
  const name = row.full_name?.trim();
  if (name) return name;
  return row.username?.trim() || row.email;
}

export function billingSourceLabel(source: string): string {
  switch (source) {
    case "admin":
      return "Admin grant";
    case "paddle":
      return "Paddle payment";
    case "referral":
      return "Referral Pro";
    default:
      return "Unknown";
  }
}

export function atRiskLabel(reason: string | null): string {
  switch (reason) {
    case "past_due":
      return "Past due";
    case "canceled_pending_expiry":
      return "Canceled — expiring soon";
    case "admin_grant_expiring":
      return "Admin grant expiring";
    case "expired":
      return "Expired";
    default:
      return reason ?? "At risk";
  }
}

export function formatAdminDate(iso: string | null | undefined): string {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleString(undefined, {
      dateStyle: "medium",
      timeStyle: "short",
    });
  } catch {
    return iso;
  }
}

export function eventTypeLabel(eventType: string): string {
  return eventType
    .replace(/^paddle_/, "")
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}
