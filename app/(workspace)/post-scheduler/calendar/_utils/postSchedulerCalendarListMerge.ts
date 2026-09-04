import stitchListSeed from "../_data/stitch-calendar-list-seed.json";
import type {
  CalendarListDaySection,
  CalendarListRow,
} from "../_types/postSchedulerCalendarListTypes";
import { addDays, startOfDay } from "./postSchedulerCalendarWeekUtils";
import { getPipelineListRowsForDays } from "./postSchedulerContentPipeline";

/** First paint: this many days starting today (local). More load on scroll. */
export const CALENDAR_LIST_DAY_COUNT = 5;

/** Each time the list bottom nears the viewport, add this many more days. */
export const CALENDAR_LIST_LOAD_MORE_DAYS = 5;

/** Stop growing the list after this many days ahead (safety cap). */
export const CALENDAR_LIST_MAX_DAYS = 120;

/** Stop loading older days after this many days before today (safety cap). */
export const CALENDAR_LIST_MAX_PAST_DAYS = 120;

/** Max rows (posts + empty slots) shown per day in list view. */
export const CALENDAR_LIST_SLOTS_PER_DAY = 5;

function dayKey(d: Date): string {
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
}

function atDayOffsetFromToday(
  now: Date,
  dayOffset: number,
  hour: number,
  minute: number,
): Date {
  const d = addDays(startOfDay(now), dayOffset);
  d.setHours(hour, minute, 0, 0);
  return d;
}

function finalizeDayRows(
  rows: CalendarListRow[],
  dayIndex: number,
  now: Date,
  day: Date,
): CalendarListRow[] {
  const sorted = rows
    .slice()
    .sort((a, b) => a.scheduledAt.getTime() - b.scheduledAt.getTime());

  const result: CalendarListRow[] =
    sorted.length > CALENDAR_LIST_SLOTS_PER_DAY
      ? sorted.slice(0, CALENDAR_LIST_SLOTS_PER_DAY)
      : [...sorted];

  const existingMs = new Set(result.map((r) => r.scheduledAt.getTime()));

  let hour = 8;
  let minute = 0;
  while (result.length < CALENDAR_LIST_SLOTS_PER_DAY && hour <= 22) {
    const scheduledAt = atDayOffsetFromToday(now, dayIndex, hour, minute);
    const t = scheduledAt.getTime();
    const clash = [...existingMs].some(
      (ms) => Math.abs(ms - t) < 20 * 60 * 1000,
    );
    if (!clash) {
      existingMs.add(t);
      result.push({
        kind: "empty_slot",
        id: `empty-pad-${dayKey(day)}-${hour}-${minute}-${result.length}`,
        scheduledAt,
      });
    }
    minute += 45;
    if (minute >= 60) {
      minute = 0;
      hour += 1;
    }
  }

  return result
    .sort((a, b) => a.scheduledAt.getTime() - b.scheduledAt.getTime())
    .slice(0, CALENDAR_LIST_SLOTS_PER_DAY);
}

export interface CalendarListRangeOptions {
  /** Calendar days before today to include (0 = list starts at today). */
  pastDays: number;
  /** Days from today forward, including today (same meaning as before). */
  futureDays: number;
}

export function getCalendarListSections(
  now: Date,
  options: CalendarListRangeOptions,
): CalendarListDaySection[] {
  const past = Math.min(
    Math.max(0, options.pastDays),
    CALENDAR_LIST_MAX_PAST_DAYS,
  );
  const future = Math.max(
    1,
    Math.min(options.futureDays, CALENDAR_LIST_MAX_DAYS),
  );
  const firstOffset = -past;
  const lastOffset = future - 1;
  const span = lastOffset - firstOffset + 1;
  const days = Array.from({ length: span }, (_, i) =>
    addDays(startOfDay(now), firstOffset + i),
  );
  const pipelineRows = getPipelineListRowsForDays(days, now);
  type StitchSlot = {
    dayOffsetFromToday: number;
    hour: number;
    minute: number;
  };
  const emptyRows: CalendarListRow[] = (
    stitchListSeed.emptySlots as StitchSlot[]
  )
    .filter(
      (slot) =>
        slot.dayOffsetFromToday >= firstOffset &&
        slot.dayOffsetFromToday <= lastOffset,
    )
    .map((slot) => ({
      kind: "empty_slot" as const,
      id: `stitch-empty-${slot.dayOffsetFromToday}-${slot.hour}-${slot.minute}`,
      scheduledAt: atDayOffsetFromToday(
        now,
        slot.dayOffsetFromToday,
        slot.hour,
        slot.minute,
      ),
    }));

  const combined: CalendarListRow[] = [...pipelineRows, ...emptyRows];
  const byDay = new Map<string, CalendarListRow[]>();
  for (const row of combined) {
    const key = dayKey(row.scheduledAt);
    const list = byDay.get(key) ?? [];
    list.push(row);
    byDay.set(key, list);
  }

  return days.map((day, i) => {
    const dayOffsetFromToday = firstOffset + i;
    let rows = (byDay.get(dayKey(day)) ?? []).slice();
    if (rows.length === 0) {
      rows.push({
        kind: "empty_slot",
        id: `default-slot-${dayKey(day)}`,
        scheduledAt: atDayOffsetFromToday(now, dayOffsetFromToday, 9, 0),
      });
    }
    rows = finalizeDayRows(rows, dayOffsetFromToday, now, day);
    return { day, rows };
  });
}
