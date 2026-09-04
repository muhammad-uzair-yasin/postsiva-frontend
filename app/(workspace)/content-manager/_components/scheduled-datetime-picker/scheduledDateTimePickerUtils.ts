import {
  addDays,
  isSameDay,
  startOfDay,
} from "@/app/(workspace)/post-scheduler/calendar/_utils/postSchedulerCalendarWeekUtils";

export function pad2(n: number): string {
  return n.toString().padStart(2, "0");
}

export function combineDateAndTime(day: Date, hours24: number, minutes: number): Date {
  const d = startOfDay(day);
  d.setHours(hours24, minutes, 0, 0);
  return d;
}

export function to12HourParts(date: Date): {
  hour12: number;
  minute: number;
  period: "AM" | "PM";
} {
  const h24 = date.getHours();
  const minute = date.getMinutes();
  const period: "AM" | "PM" = h24 >= 12 ? "PM" : "AM";
  let hour12 = h24 % 12;
  if (hour12 === 0) hour12 = 12;
  return { hour12, minute, period };
}

export function from12HourParts(
  hour12: number,
  minute: number,
  period: "AM" | "PM",
): { hours24: number; minute: number } {
  let h = hour12 % 12;
  if (period === "PM") h += 12;
  if (period === "AM" && hour12 === 12) h = 0;
  return { hours24: h, minute: Math.min(59, Math.max(0, minute)) };
}

export function formatSummary(date: Date): string {
  return date.toLocaleString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

export function formatMonthYear(date: Date): string {
  return date.toLocaleDateString(undefined, { month: "long", year: "numeric" });
}

export function defaultPickDateTime(day: Date, now: Date): Date {
  const base = startOfDay(day);
  if (!isSameDay(day, now)) {
    base.setHours(9, 0, 0, 0);
    return base;
  }
  const d = new Date(now);
  d.setMinutes(d.getMinutes() + 30, 0, 0);
  if (d.getHours() < 8) {
    d.setHours(9, 0, 0, 0);
  }
  return d;
}

/** Build month grid cells (Sun–Sat), including leading/trailing days from adjacent months. */
export function buildMonthGrid(viewMonth: Date): Date[] {
  const first = new Date(viewMonth.getFullYear(), viewMonth.getMonth(), 1);
  const startOffset = first.getDay(); // 0 = Sunday
  const gridStart = addDays(first, -startOffset);
  return Array.from({ length: 42 }, (_, i) => addDays(gridStart, i));
}

export function isBeforeDay(a: Date, b: Date): boolean {
  return startOfDay(a).getTime() < startOfDay(b).getTime();
}

export function nextMonday(from: Date): Date {
  const d = startOfDay(from);
  const day = d.getDay();
  const delta = day === 0 ? 1 : day === 1 ? 7 : 8 - day;
  return addDays(d, delta);
}

export function nextFriday(from: Date): Date {
  const d = startOfDay(from);
  const day = d.getDay(); // 0 Sun … 5 Fri
  const delta = day === 5 ? 7 : (5 - day + 7) % 7 || 7;
  return addDays(d, delta);
}

export function tonightOrTomorrowAt(from: Date, hour24: number, minute = 0): Date {
  const d = new Date(from);
  d.setHours(hour24, minute, 0, 0);
  if (d.getTime() <= from.getTime()) {
    return combineDateAndTime(addDays(startOfDay(from), 1), hour24, minute);
  }
  return d;
}

/**
 * Parse free-form time: "10:30 AM", "10:30am", "14:30", "2:05 pm".
 * Returns null if invalid.
 */
export function parseCustomTime(raw: string): { hours24: number; minute: number } | null {
  const text = raw.trim().toLowerCase().replace(/\s+/g, " ");
  if (!text) return null;

  const match12 = text.match(/^(\d{1,2}):(\d{2})\s*(am|pm)$/i);
  if (match12) {
    const hour12 = Number(match12[1]);
    const minute = Number(match12[2]);
    if (hour12 < 1 || hour12 > 12 || minute > 59) return null;
    return from12HourParts(hour12, minute, match12[3].toUpperCase() as "AM" | "PM");
  }

  const match24 = text.match(/^(\d{1,2}):(\d{2})$/);
  if (match24) {
    const hours24 = Number(match24[1]);
    const minute = Number(match24[2]);
    if (hours24 > 23 || minute > 59) return null;
    return { hours24, minute };
  }

  return null;
}

export function formatCustomTimeInput(date: Date): string {
  const { hour12, minute, period } = to12HourParts(date);
  return `${hour12}:${pad2(minute)} ${period}`;
}

export function clampFuture(date: Date, now: Date): Date {
  if (date.getTime() > now.getTime()) return date;
  const next = new Date(now);
  next.setMinutes(next.getMinutes() + 5, 0, 0);
  return next;
}
