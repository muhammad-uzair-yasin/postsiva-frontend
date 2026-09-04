/** Types + pure helpers for the admin email analytics page (`/admin/emails`).
 *
 * Wraps `GET /admin/api/emails/analytics` (legacy
 * `/user-activity/admin/email-outbound-analytics`). Fetching lives in the page
 * hook via `adminGet`; everything here is side-effect free for unit testing.
 */

import { clampInt } from "./apiHitsApi";

export interface EmailKindRow {
  email_kind: string;
  send_count: number;
  unique_recipient_emails: number;
}

export interface EmailRecentRow {
  id: string;
  sent_at: string;
  email_kind: string;
  recipient_email: string;
  recipient_user_id: string | null;
  admin_user_id: string | null;
  admin_email: string | null;
  subject_snippet: string | null;
}

export interface EmailAnalyticsResponse {
  success: boolean;
  days: number;
  period_start_utc: string;
  total_emails_sent: number;
  unique_recipient_emails: number;
  distinct_email_kinds: number;
  by_kind: EmailKindRow[];
  recent: EmailRecentRow[];
}

export const EMAILS_DEFAULT_DAYS = 30;
export const EMAILS_MAX_DAYS = 365;
export const EMAILS_DEFAULT_RECENT_LIMIT = 100;
export const EMAILS_MAX_RECENT_LIMIT = 500;

export function clampEmailDays(raw: string | number | null | undefined): number {
  return clampInt(raw, EMAILS_DEFAULT_DAYS, 1, EMAILS_MAX_DAYS);
}

export function clampRecentLimit(raw: string | number | null | undefined): number {
  return clampInt(raw, EMAILS_DEFAULT_RECENT_LIMIT, 1, EMAILS_MAX_RECENT_LIMIT);
}

export function buildEmailAnalyticsPath(days: number, recentLimit: number): string {
  return `/admin/api/emails/analytics?days=${days}&recent_limit=${recentLimit}`;
}

/** Legacy period label: `Since 2026-06-21T00:00Z (UTC)`; empty on bad input. */
export function periodLabel(periodStartUtc: string | null | undefined): string {
  if (!periodStartUtc) return "";
  const d = new Date(periodStartUtc);
  if (Number.isNaN(d.getTime())) return "";
  return `Since ${d.toISOString().slice(0, 16)}Z (UTC)`;
}

/** Legacy recent-row timestamp: `2026-06-21 14:03:22 UTC`; em dash when missing. */
export function formatSentAt(iso: string | null | undefined): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return `${d.toISOString().slice(0, 19).replace("T", " ")} UTC`;
}

/** Legacy stat-tile formatting: localized number, em dash when null/undefined. */
export function formatStat(value: number | null | undefined): string {
  return typeof value === "number" ? value.toLocaleString() : "—";
}
