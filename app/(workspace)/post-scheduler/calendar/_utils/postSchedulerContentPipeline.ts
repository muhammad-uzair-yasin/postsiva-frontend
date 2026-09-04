import type { CalendarListRow } from "../_types/postSchedulerCalendarListTypes";

/**
 * Scheduled pipeline cards for the calendar list. Wired to real workspace data when available.
 * Returns no placeholder rows.
 */
export function getPipelineListRowsForDays(
  _days: readonly Date[],
  _now: Date,
): CalendarListRow[] {
  return [];
}
