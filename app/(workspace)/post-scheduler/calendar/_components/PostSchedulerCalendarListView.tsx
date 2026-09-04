"use client";

import { Fragment, useCallback, useRef } from "react";
import { useTranslations } from "@/lib/i18n/WorkspaceLocaleProvider";
import { useWorkspaceComposerModal } from "@/app/(workspace)/_components/WorkspaceComposerModalProvider";
import { useCalendarNow } from "../_hooks/useCalendarNow";
import { usePostSchedulerCalendarList } from "../_hooks/usePostSchedulerCalendarList";
import {
  dayHeaderDotClass,
  dayHeaderTitleClass,
  formatPipelineDayHeading,
} from "../_utils/postSchedulerCalendarListViewHeadings";
import { isSameDay } from "../_utils/postSchedulerCalendarWeekUtils";
import { PostSchedulerCalendarListRow } from "./PostSchedulerCalendarListRow";
import { PostSchedulerCalendarPipelineCard } from "./PostSchedulerCalendarPipelineCard";

export interface PostSchedulerCalendarListViewProps {
  /**
   * When set, empty-slot taps call this (e.g. draft editor time picker) instead of opening the composer.
   */
  onPickTimeSlot?: (at: Date) => void;
}

export function PostSchedulerCalendarListView({
  onPickTimeSlot,
}: PostSchedulerCalendarListViewProps = {}): React.ReactElement {
  const { t, locale } = useTranslations();
  const pickerMode = typeof onPickTimeSlot === "function";
  const { openComposer } = useWorkspaceComposerModal();

  const now = useCalendarNow();
  const {
    sections,
    scrollRootRef,
    topSentinelRef,
    bottomSentinelRef,
    loadEarlierDays,
    canLoadEarlierPast,
  } = usePostSchedulerCalendarList(now);

  const todaySectionRef = useRef<HTMLDivElement | null>(null);

  const scrollToToday = useCallback((): void => {
    todaySectionRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }, []);

  const handleEmptySlot = useCallback(
    (at: Date): void => {
      if (pickerMode) {
        onPickTimeSlot?.(at);
        return;
      }
      openComposer(at);
    },
    [onPickTimeSlot, openComposer, pickerMode],
  );

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
      <div
        ref={scrollRootRef}
        className="workspace-dashboard-scroll min-h-0 flex-1 overflow-auto pb-10 pt-2"
      >
        <div className="relative space-y-12 before:absolute before:bottom-4 before:left-6 before:top-4 before:w-px before:bg-gradient-to-b before:from-primary/40 before:via-secondary/40 before:to-transparent">
          <div className="relative flex flex-col gap-2 pl-14 pr-2 pb-4">
            {canLoadEarlierPast ? (
              <button
                type="button"
                onClick={loadEarlierDays}
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-outline-variant/20 bg-surface-container-low/80 py-3 text-sm font-semibold text-on-surface transition-colors hover:border-outline-variant/35 hover:bg-surface-container"
              >
                <span className="material-symbols-outlined text-lg text-primary">
                  expand_less
                </span>
                {t("postScheduler.calendar.loadEarlier")}
              </button>
            ) : null}
            <button
              type="button"
              onClick={scrollToToday}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-primary/25 bg-primary-container/15 py-3 text-sm font-semibold text-on-surface transition-colors hover:border-primary/40 hover:bg-primary-container/25"
            >
              <span
                className="material-symbols-outlined text-lg text-primary"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                today
              </span>
              {t("postScheduler.calendar.jumpToToday")}
            </button>
          </div>
          <div ref={topSentinelRef} className="h-2 shrink-0" aria-hidden />
          {sections.map((section, sectionIndex) => (
            <Fragment key={section.day.toISOString()}>
              <div
                ref={(el) => {
                  if (isSameDay(section.day, now)) {
                    todaySectionRef.current = el;
                  }
                }}
                className={`relative scroll-mt-4 pl-14 ${sectionIndex > 0 ? "pt-4" : ""}`}
              >
                <div
                  className={`absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 rounded-full ${dayHeaderDotClass(section.day, now)}`}
                  aria-hidden
                />
                <h3
                  className={`text-xs font-bold uppercase tracking-widest ${dayHeaderTitleClass(section.day, now)}`}
                >
                  {formatPipelineDayHeading(section.day, now, locale, t)}
                </h3>
              </div>
              {section.rows.map((row) =>
                row.kind === "pipeline_card" ? (
                  <PostSchedulerCalendarPipelineCard
                    key={row.id}
                    row={row}
                    now={now}
                    onOpenComposer={openComposer}
                    pickerMode={pickerMode}
                  />
                ) : (
                  <PostSchedulerCalendarListRow
                    key={row.id}
                    row={row}
                    onOpenComposer={handleEmptySlot}
                  />
                ),
              )}
            </Fragment>
          ))}
          <div ref={bottomSentinelRef} className="h-8 shrink-0" aria-hidden />
        </div>
      </div>
    </div>
  );
}
