"use client";

import { useTranslations } from "@/lib/i18n/WorkspaceLocaleProvider";
import type { CalendarListRow } from "../_types/postSchedulerCalendarListTypes";

interface PostSchedulerCalendarListRowProps {
  row: Extract<CalendarListRow, { kind: "empty_slot" }>;
  onOpenComposer: (at: Date) => void;
}

export function PostSchedulerCalendarListRow({
  row,
  onOpenComposer,
}: PostSchedulerCalendarListRowProps): React.ReactElement {
  const { t, locale } = useTranslations();

  const formatListTime = (d: Date): string =>
    d.toLocaleTimeString(locale, {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });

  return (
    <article className="relative pl-14">
      <div
        className="absolute left-5 top-6 h-2 w-2 rounded-full bg-outline-variant/40"
        aria-hidden
      />
      <button
        type="button"
        onClick={() => {
          onOpenComposer(row.scheduledAt);
        }}
        className="flex w-full min-h-[3.5rem] items-center rounded-xl border border-dashed border-outline-variant/25 bg-surface-container-low/60 px-4 py-3 text-left text-sm font-semibold text-on-surface-variant transition-colors hover:border-secondary/30 hover:bg-surface-container-low hover:text-on-surface"
      >
        <span className="text-primary">{t("postScheduler.calendar.newShortcut")}</span>
        <span className="ml-2 text-xs font-medium text-on-surface-variant/80">
          {formatListTime(row.scheduledAt)}
        </span>
      </button>
    </article>
  );
}
