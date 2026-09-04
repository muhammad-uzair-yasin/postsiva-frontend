import { formatStatCount } from "@/lib/dashboard/profileCard/formatStatCount";

/** Large metric totals (posts, likes, reach, …). */
export function formatAnalyticsCount(value: number): string {
  return formatStatCount(value);
}

/** `average_engagement_rate` from API is 0–1 (e.g. 0.063 → 6.3%). */
export function formatEngagementRate(
  rate: number,
  fractionDigits: number = 1,
): string {
  if (!Number.isFinite(rate)) {
    return "—";
  }
  return `${(rate * 100).toFixed(fractionDigits)}%`;
}
