import type { ContentManagerPost } from "../_types/contentManagerTypes";
import type { ContentManagerScheduledDaySection } from "./groupContentManagerScheduledPostsByDay";
import {
  addDays,
  isSameDay,
  startOfDay,
} from "../../post-scheduler/calendar/_utils/postSchedulerCalendarWeekUtils";

/** Default visible days from today (local, inclusive). */
export const SCHEDULED_PIPELINE_DEFAULT_UPCOMING_DAYS = 3;

/** Cap for “Load more days” (inclusive). */
export const SCHEDULED_PIPELINE_MAX_UPCOMING_DAYS = 30;

/** Dashed “+ New” preset rows per day (suggested free times). */
export const SCHEDULED_PIPELINE_EMPTY_SLOTS_PER_DAY = 5;

/** Minutes between suggested slot times (60 = one slot per hour). */
const EMPTY_SLOT_STEP_MINUTES = 60;

const EMPTY_CLASH_MS = 20 * 60 * 1000;

export type ScheduledPipelineTimelineItem =
  | { kind: "post"; post: ContentManagerPost; scheduledAt: Date }
  | { kind: "empty"; at: Date; id: string }
  /** Per-day row: pick any time, then open scheduler. */
  | { kind: "custom_time"; day: Date; id: string };

export interface ScheduledPipelineDayBlock {
  day: Date;
  items: ScheduledPipelineTimelineItem[];
}

function dayStartMs(d: Date): number {
  return startOfDay(d).getTime();
}

function hasTimeClash(at: Date, busy: readonly Date[]): boolean {
  const t = at.getTime();
  return busy.some((b) => Math.abs(b.getTime() - t) < EMPTY_CLASH_MS);
}

/**
 * Suggested free hourly slots that do not sit on top of existing posts.
 * - Today: next 5 hours from now (strictly upcoming; no past hours).
 * - Future days: 8:00–22:00, up to `maxSlots`.
 * - Past days: none.
 */
function generateEmptySlotTimesForDay(
  day: Date,
  now: Date,
  postTimes: readonly Date[],
  maxSlots: number,
): Date[] {
  const result: Date[] = [];
  const dayStart = startOfDay(day);
  const isToday = isSameDay(day, now);

  if (dayStart.getTime() < startOfDay(now).getTime()) {
    return [];
  }

  let hour: number;
  let minute = 0;
  /** Inclusive last hour to offer (today can go later into the evening). */
  let maxHour = 22;

  if (isToday) {
    const nextHour = new Date(now);
    nextHour.setSeconds(0, 0);
    nextHour.setMinutes(0);
    nextHour.setHours(nextHour.getHours() + 1);
    if (!isSameDay(nextHour, day)) {
      return [];
    }
    hour = nextHour.getHours();
    maxHour = 23;
  } else {
    hour = 8;
  }

  while (result.length < maxSlots && hour <= maxHour) {
    const at = new Date(dayStart);
    at.setHours(hour, minute, 0, 0);

    if (at.getTime() > now.getTime()) {
      const busy = [...postTimes, ...result];
      if (!hasTimeClash(at, busy)) {
        result.push(at);
      }
    }

    minute += EMPTY_SLOT_STEP_MINUTES;
    if (minute >= 60) {
      minute -= 60;
      hour += 1;
    }
  }

  return result;
}

function mergeItemsForDay(
  day: Date,
  now: Date,
  rows: ReadonlyArray<{ post: ContentManagerPost; scheduledAt: Date }>,
): ScheduledPipelineTimelineItem[] {
  const postTimes = rows.map((r) => r.scheduledAt);
  const empties = generateEmptySlotTimesForDay(
    day,
    now,
    postTimes,
    SCHEDULED_PIPELINE_EMPTY_SLOTS_PER_DAY,
  );

  type PostOrEmpty = Extract<
    ScheduledPipelineTimelineItem,
    { kind: "post" | "empty" }
  >;

  const items: PostOrEmpty[] = [
    ...rows.map((r) => ({
      kind: "post" as const,
      post: r.post,
      scheduledAt: r.scheduledAt,
    })),
    ...empties.map((at, i) => ({
      kind: "empty" as const,
      at,
      id: `empty-${dayStartMs(day)}-${at.getHours()}-${at.getMinutes()}-${i}`,
    })),
  ];

  items.sort((a, b) => {
    const aMs = a.kind === "post" ? a.scheduledAt.getTime() : a.at.getTime();
    const bMs = b.kind === "post" ? b.scheduledAt.getTime() : b.at.getTime();
    return aMs - bMs;
  });

  // Custom time picker first for each day, then posts + suggested slots.
  return [
    {
      kind: "custom_time",
      day,
      id: `custom-time-${dayStartMs(day)}`,
    },
    ...items,
  ];
}

/** Seven day columns for calendar week view (`weekStart` … +6 days). */
export function buildContentManagerScheduledWeekBlocks(
  weekStart: Date,
  now: Date,
  sections: ContentManagerScheduledDaySection[],
): ScheduledPipelineDayBlock[] {
  const postsByDay = new Map<
    number,
    Array<{ post: ContentManagerPost; scheduledAt: Date }>
  >();
  for (const s of sections) {
    postsByDay.set(dayStartMs(s.day), s.posts);
  }

  return Array.from({ length: 7 }, (_, i) => {
    const day = addDays(startOfDay(weekStart), i);
    const rows = postsByDay.get(dayStartMs(day)) ?? [];
    return {
      day,
      items: mergeItemsForDay(day, now, rows),
    };
  });
}

export interface ScheduledPipelineTimelineModel {
  /** Days before today that still have scheduled rows (rare). */
  earlierSections: ContentManagerScheduledDaySection[];
  /** Today … +N−1 days — each block includes posts plus dashed empty slots. */
  upcomingDayBlocks: ScheduledPipelineDayBlock[];
  /** Days after the visible upcoming window (posts only). */
  laterSections: ContentManagerScheduledDaySection[];
  undated: ContentManagerPost[];
}

function clampUpcomingDayCount(raw: number): number {
  const n = Math.floor(Number.isFinite(raw) ? raw : SCHEDULED_PIPELINE_DEFAULT_UPCOMING_DAYS);
  return Math.min(
    SCHEDULED_PIPELINE_MAX_UPCOMING_DAYS,
    Math.max(1, n),
  );
}

export function buildContentManagerScheduledUpcomingTimeline(
  now: Date,
  sections: ContentManagerScheduledDaySection[],
  undated: ContentManagerPost[],
  upcomingDayCount: number = SCHEDULED_PIPELINE_DEFAULT_UPCOMING_DAYS,
): ScheduledPipelineTimelineModel {
  const daysVisible = clampUpcomingDayCount(upcomingDayCount);
  const todayStart = startOfDay(now);
  const lastUpcomingStart = addDays(todayStart, daysVisible - 1);

  const postsByDay = new Map<
    number,
    Array<{ post: ContentManagerPost; scheduledAt: Date }>
  >();
  for (const s of sections) {
    postsByDay.set(dayStartMs(s.day), s.posts);
  }

  const earlierSections: ContentManagerScheduledDaySection[] = [];
  const laterSections: ContentManagerScheduledDaySection[] = [];

  for (const s of sections) {
    const sod = dayStartMs(s.day);
    if (sod < todayStart.getTime()) {
      earlierSections.push(s);
    } else if (sod > lastUpcomingStart.getTime()) {
      laterSections.push(s);
    }
  }

  const upcomingDayBlocks: ScheduledPipelineDayBlock[] = Array.from(
    { length: daysVisible },
    (_, i) => {
      const day = addDays(todayStart, i);
      const rows = postsByDay.get(dayStartMs(day)) ?? [];
      return {
        day,
        items: mergeItemsForDay(day, now, rows),
      };
    },
  );

  return {
    earlierSections,
    upcomingDayBlocks,
    laterSections,
    undated,
  };
}
