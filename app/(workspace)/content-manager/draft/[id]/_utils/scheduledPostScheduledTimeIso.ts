import type { UnifiedScheduledPostItemJson } from "@/lib/social/unifiedScheduledPostsApi";

/** Parses API fields into an ISO string for the schedule UI (`datetime-local` / labels). */
export function scheduledPostTimeAsIsoUtc(
  item: UnifiedScheduledPostItemJson,
): string | null {
  const raw =
    item.scheduled_time?.trim() ||
    item.scheduled_time_local?.trim() ||
    "";
  if (!raw) {
    return null;
  }
  const hasOffset = /(?:Z|[+-]\d{2}:?\d{2})$/i.test(raw);
  const normalized = item.scheduled_time?.trim() && !hasOffset ? `${raw}Z` : raw;
  const d = new Date(normalized);
  if (Number.isNaN(d.getTime())) {
    return null;
  }
  return d.toISOString();
}
