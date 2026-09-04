"use client";

import { useTranslations } from "@/lib/i18n/WorkspaceLocaleProvider";
import type { CalendarListRow } from "../_types/postSchedulerCalendarListTypes";
import { formatPipelineCardScheduleLabel } from "../_utils/postSchedulerPipelineCardFormat";
import { PostSchedulerCalendarPipelinePlatformStack } from "./PostSchedulerCalendarPipelinePlatformStack";

type PipelineCardRow = Extract<CalendarListRow, { kind: "pipeline_card" }>;

interface PostSchedulerCalendarPipelineCardProps {
  row: PipelineCardRow;
  now: Date;
  onOpenComposer: (at: Date) => void;
  /** Hides schedule/composer actions — used when picking an empty slot time only. */
  pickerMode?: boolean;
}

export function PostSchedulerCalendarPipelineCard({
  row,
  now,
  onOpenComposer,
  pickerMode = false,
}: PostSchedulerCalendarPipelineCardProps): React.ReactElement {
  const { t, locale } = useTranslations();
  const dotClass =
    row.timelineDot === "secondary"
      ? "bg-secondary"
      : "bg-primary/40";

  return (
    <article className="group relative pl-14">
      <div
        className={`absolute left-5 top-8 h-2 w-2 rounded-full ${dotClass}`}
        aria-hidden
      />
      <div className="overflow-hidden rounded-xl border border-transparent bg-surface-container-low shadow-xl transition-all duration-300 hover:border-outline-variant/10 hover:bg-surface-container">
        <div className="flex flex-col md:flex-row">
          <div
            className={`relative h-48 w-full overflow-hidden md:h-auto md:w-64 ${
              row.isVideo ? "flex items-center justify-center bg-surface-container-highest" : ""
            }`}
          >
            <img
              alt=""
              className={`h-full w-full object-cover transition-transform duration-700 group-hover:scale-110 ${
                row.isVideo ? "opacity-60" : ""
              }`}
              src={row.imageUrl}
            />
            {row.isVideo ? (
              <span className="material-symbols-outlined pointer-events-none absolute text-4xl text-on-surface/50">
                videocam
              </span>
            ) : null}
          </div>
          <div className="flex flex-1 flex-col justify-between p-6">
            <div>
              <div className="mb-3 flex items-center justify-between">
                <div className="flex flex-wrap items-center gap-2">
                  {row.status === "scheduled" ? (
                    <span className="rounded bg-secondary/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-secondary">
                      {t("postScheduler.calendar.badgeScheduled")}
                    </span>
                  ) : (
                    <span className="rounded bg-surface-variant px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">
                      {t("postScheduler.calendar.badgeDraft")}
                    </span>
                  )}
                  <span className="text-xs font-medium text-on-surface-variant">
                    {formatPipelineCardScheduleLabel(row.scheduledAt, now, locale, t)}
                  </span>
                </div>
                <PostSchedulerCalendarPipelinePlatformStack
                  platforms={row.platforms}
                />
              </div>
              <p className="mb-1 text-xs font-medium text-on-surface-variant">
                {row.handle}
              </p>
              <p className="line-clamp-2 text-sm leading-relaxed text-on-surface">
                {row.body}
              </p>
            </div>
            {pickerMode ? null : (
              <div className="mt-4 flex items-center justify-between">
                <div className="flex gap-4">
                  <button
                    type="button"
                    className="text-on-surface-variant transition-colors hover:text-primary"
                    aria-label={t("postScheduler.calendar.edit")}
                  >
                    <span className="material-symbols-outlined text-lg">
                      edit_square
                    </span>
                  </button>
                  <button
                    type="button"
                    className="text-on-surface-variant transition-colors hover:text-error"
                    aria-label={t("postScheduler.calendar.delete")}
                  >
                    <span className="material-symbols-outlined text-lg">
                      delete
                    </span>
                  </button>
                </div>
                {row.footerAction === "view_analytics" ? (
                  <button
                    type="button"
                    className="text-xs font-bold text-secondary underline-offset-4 hover:underline"
                  >
                    {t("postScheduler.calendar.viewAnalytics")}
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      onOpenComposer(row.scheduledAt);
                    }}
                    className="rounded-full bg-primary/10 px-4 py-1.5 text-xs font-bold text-primary transition-all hover:bg-primary/20"
                  >
                    {t("postScheduler.calendar.reviewSchedule")}
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}
