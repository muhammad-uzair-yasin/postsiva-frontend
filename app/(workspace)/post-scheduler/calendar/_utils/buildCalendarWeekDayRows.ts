import type { CalendarPost } from "../_types/calendarTypes";
import { localDayKey } from "./calendarData";
import {
  addDays,
  startOfDay,
} from "./postSchedulerCalendarWeekUtils";

/** Default visible 2-hour blocks for the week grid (full day). */
export const CALENDAR_WEEK_TWO_HOUR_SLOTS: readonly number[] = Array.from(
  { length: 12 },
  (_, i) => i * 2,
);

/** @deprecated Use CALENDAR_WEEK_TWO_HOUR_SLOTS — kept for tests importing default hours. */
export const CALENDAR_WEEK_DEFAULT_HOURS: readonly number[] = CALENDAR_WEEK_TWO_HOUR_SLOTS;

export type CalendarWeekTimeCell =
  | { kind: "posts"; at: Date; posts: CalendarPost[] }
  | { kind: "empty"; at: Date; id: string }
  | { kind: "past"; at: Date; id: string };

export interface CalendarWeekTimeGrid {
  readonly days: Date[];
  readonly hours: number[];
  /** cells[dayIndex][hourIndex] */
  readonly cells: CalendarWeekTimeCell[][];
}

const TWO_HOUR_SLOT_MINUTES = 120;

function hourKey(date: Date): number {
  return date.getHours();
}

function twoHourSlotStart(hour: number): number {
  return Math.floor(hour / 2) * 2;
}

function slotAt(day: Date, hour: number): Date {
  const at = startOfDay(day);
  at.setHours(hour, 0, 0, 0);
  return at;
}

function collectHours(weekPosts: readonly CalendarPost[]): number[] {
  const hours = new Set<number>(CALENDAR_WEEK_TWO_HOUR_SLOTS);
  for (const post of weekPosts) {
    hours.add(twoHourSlotStart(hourKey(post.scheduledAt)));
  }
  return [...hours].sort((a, b) => a - b);
}

function postsInSlot(
  dayPosts: readonly CalendarPost[],
  slotStartHour: number,
): CalendarPost[] {
  return dayPosts
    .filter((post) => {
      const hour = hourKey(post.scheduledAt);
      return hour >= slotStartHour && hour < slotStartHour + 2;
    })
    .sort(
      (a, b) =>
        a.scheduledAt.getTime() - b.scheduledAt.getTime() ||
        a.id.localeCompare(b.id),
    );
}

/** 0–1 position of a post within its 2-hour block (for vertical placement in the cell). */
export function calendarPostOffsetInTwoHourSlot(
  scheduledAt: Date,
  slotStartHour: number,
): number {
  const minutesIntoSlot =
    (scheduledAt.getHours() - slotStartHour) * 60 + scheduledAt.getMinutes();
  return Math.max(0, Math.min(1, minutesIntoSlot / TWO_HOUR_SLOT_MINUTES));
}

export function buildCalendarWeekTimeGrid(
  weekStart: Date,
  now: Date,
  posts: CalendarPost[],
): CalendarWeekTimeGrid {
  const days = Array.from({ length: 7 }, (_, i) => addDays(startOfDay(weekStart), i));
  const grouped = new Map<string, CalendarPost[]>();
  for (const post of posts) {
    const key = localDayKey(post.scheduledAt);
    grouped.set(key, [...(grouped.get(key) ?? []), post]);
  }

  const hours = collectHours(posts);
  const nowMs = now.getTime();

  const cells = days.map((day) => {
    const dayPosts = grouped.get(localDayKey(day)) ?? [];
    return hours.map((hour) => {
      const at = slotAt(day, hour);
      const hourPosts = postsInSlot(dayPosts, hour);
      if (hourPosts.length > 0) {
        return { kind: "posts" as const, at, posts: hourPosts };
      }
      if (at.getTime() > nowMs) {
        return {
          kind: "empty" as const,
          at,
          id: `empty-${day.getTime()}-${hour}`,
        };
      }
      return {
        kind: "past" as const,
        at,
        id: `past-${day.getTime()}-${hour}`,
      };
    });
  });

  return { days, hours, cells };
}
