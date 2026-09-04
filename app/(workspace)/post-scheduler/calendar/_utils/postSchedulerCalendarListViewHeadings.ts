import { startOfDay } from "./postSchedulerCalendarWeekUtils";

export function formatPipelineDayHeading(
  day: Date,
  now: Date,
  locale: string,
  t: (key: string, vars?: Record<string, string | number>) => string,
): string {
  const sodA = startOfDay(day).getTime();
  const sodN = startOfDay(now).getTime();
  const diff = Math.round((sodA - sodN) / 86400000);
  const mon = day.toLocaleDateString(locale, { month: "short" });
  const num = String(day.getDate());
  if (diff === 0) {
    return t("postScheduler.calendar.todayBullet", { month: mon, day: num });
  }
  if (diff === 1) {
    return t("postScheduler.calendar.tomorrowBullet", { month: mon, day: num });
  }
  if (diff === -1) {
    return t("postScheduler.calendar.yesterdayBullet", { month: mon, day: num });
  }
  const wk = day.toLocaleDateString(locale, { weekday: "long" });
  return t("postScheduler.calendar.weekdayBullet", {
    weekday: wk,
    month: mon,
    day: num,
  });
}

export function dayHeaderTitleClass(day: Date, now: Date): string {
  const diff = Math.round(
    (startOfDay(day).getTime() - startOfDay(now).getTime()) / 86400000,
  );
  if (diff === 0 || diff === 1 || diff === -1) {
    return "text-on-surface";
  }
  return "text-on-surface-variant";
}

export function dayHeaderDotClass(day: Date, now: Date): string {
  const diff = Math.round(
    (startOfDay(day).getTime() - startOfDay(now).getTime()) / 86400000,
  );
  if (diff === 0) {
    return "bg-primary ring-4 ring-primary-container/20";
  }
  if (diff === -1) {
    return "bg-outline-variant/40";
  }
  return "bg-outline-variant/30";
}
