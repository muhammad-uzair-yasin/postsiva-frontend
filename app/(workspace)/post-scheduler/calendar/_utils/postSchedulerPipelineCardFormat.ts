import { startOfDay } from "./postSchedulerCalendarWeekUtils";

export function formatPipelineCardScheduleLabel(
  at: Date,
  now: Date,
  locale: string,
  t: (key: string, vars?: Record<string, string | number>) => string,
): string {
  const sodA = startOfDay(at).getTime();
  const sodN = startOfDay(now).getTime();
  const diffDays = Math.round((sodA - sodN) / 86400000);
  const timeStr = at.toLocaleTimeString(locale, {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
  if (diffDays === 0) {
    return t("postScheduler.calendar.todayAt", { time: timeStr });
  }
  if (diffDays === 1) {
    return t("postScheduler.calendar.tomorrowAt", { time: timeStr });
  }
  const dateStr = at.toLocaleDateString(locale, {
    month: "short",
    day: "numeric",
  });
  return t("postScheduler.calendar.dateAt", { date: dateStr, time: timeStr });
}
