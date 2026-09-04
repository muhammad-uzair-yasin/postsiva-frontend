/** Six evenly spaced rows for the week view (2-hour blocks). */
export const CALENDAR_WEEK_VIEW_SLOT_HOURS: readonly number[] = [8, 10, 12, 14, 16, 18];

export function formatSlotTime12h(hour: number, minute = 0): string {
  const d = new Date();
  d.setHours(hour, minute, 0, 0);
  return d.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

/** Start hour for each row (12 rows = full day, 2 hours per row). */
export const TWO_HOUR_SLOT_START_HOURS: readonly number[] = Array.from(
  { length: 12 },
  (_, i) => i * 2,
);

export function formatWeekNavLabel(start: Date): string {
  const end = addDays(start, 6);
  const year = start.getFullYear();
  const endYear = end.getFullYear();
  const startMonth = start.toLocaleString("en-US", { month: "short" });
  const endMonth = end.toLocaleString("en-US", { month: "short" });
  if (start.getMonth() === end.getMonth() && year === endYear) {
    return `${startMonth} ${year}`;
  }
  if (year === endYear) {
    return `${startMonth}-${endMonth} ${year}`;
  }
  return `${startMonth} ${year} – ${endMonth} ${endYear}`;
}

/** Shared row height for time labels and day cells (week view, 2-hour blocks). */
export const WEEK_VIEW_SLOT_ROW_CLASS =
  "min-h-[4.5rem] shrink-0 border-b border-outline-variant/30";

export function formatHourLabel(hour: number): string {
  if (hour === 0) return "12 AM";
  if (hour < 12) return `${hour} AM`;
  if (hour === 12) return "12 PM";
  return `${hour - 12} PM`;
}

export function startOfWeekMonday(from: Date): Date {
  const d = new Date(from);
  d.setHours(0, 0, 0, 0);
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  return d;
}

export function addDays(base: Date, delta: number): Date {
  const d = new Date(base);
  d.setDate(d.getDate() + delta);
  return d;
}

export function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export function startOfDay(d: Date): Date {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

export function formatMonthYear(d: Date): string {
  return d.toLocaleDateString("en-US", { month: "long", year: "numeric" });
}

export function formatWeekRangeCompact(start: Date): string {
  const end = addDays(start, 6);
  const sm = start.toLocaleString("en-US", { month: "short" });
  const em = end.toLocaleString("en-US", { month: "short" });
  if (sm === em) {
    return `${sm} ${start.getDate()}–${end.getDate()}`;
  }
  return `${sm} ${start.getDate()} – ${em} ${end.getDate()}`;
}

export function weekDayLabels(startMonday: Date): Date[] {
  return Array.from({ length: 7 }, (_, i) => addDays(startMonday, i));
}

/** `count` calendar days starting at local midnight of `from` (inclusive). */
export function getRollingDaysFrom(from: Date, count: number): Date[] {
  const start = startOfDay(from);
  return Array.from({ length: count }, (_, i) => addDays(start, i));
}
