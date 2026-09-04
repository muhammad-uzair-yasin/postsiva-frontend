"use client";

import { Fragment, useMemo, useState, type ReactElement } from "react";

import { useTranslations } from "@/lib/i18n/WorkspaceLocaleProvider";
import { useCalendarNow } from "../../post-scheduler/calendar/_hooks/useCalendarNow";
import {
  dayHeaderDotClass,
  dayHeaderTitleClass,
  formatPipelineDayHeading,
} from "../../post-scheduler/calendar/_utils/postSchedulerCalendarListViewHeadings";
import type { ContentManagerPost } from "../_types/contentManagerTypes";
import {
  buildContentManagerScheduledUpcomingTimeline,
  SCHEDULED_PIPELINE_DEFAULT_UPCOMING_DAYS,
  SCHEDULED_PIPELINE_MAX_UPCOMING_DAYS,
} from "../_utils/buildContentManagerScheduledUpcomingTimeline";
import { groupContentManagerScheduledPostsByDay } from "../_utils/groupContentManagerScheduledPostsByDay";
import { ContentManagerScheduledCustomTimeRow } from "./ContentManagerScheduledCustomTimeRow";
import { ContentManagerScheduledEmptySlotRow } from "./ContentManagerScheduledEmptySlotRow";
import { ContentManagerScheduledPipelineCard } from "./ContentManagerScheduledPipelineCard";
import { ContentManagerScheduledPipelineColumns } from "./ContentManagerScheduledPipelineColumns";

interface ContentManagerScheduledPipelineListProps {
  posts: ContentManagerPost[];
  onOpenScheduledEditor: (post: ContentManagerPost) => void;
  onRequestDeleteScheduled: (post: ContentManagerPost) => void;
  /** When set, empty/custom slots pick a time instead of opening the composer. */
  onPickSlot?: (at: Date) => void;
  /** Calendar page already owns the Week/List switcher, so keep this view as List. */
  forceList?: boolean;
  /** Calendar list: omit days before today (published history stays on Week). */
  fromTodayOnly?: boolean;
}

type PipelineLayout = "list" | "columns";

const LOAD_MORE_DAY_STEP = 3;

export function ContentManagerScheduledPipelineList({
  posts,
  onOpenScheduledEditor,
  onRequestDeleteScheduled,
  onPickSlot,
  forceList = false,
  fromTodayOnly = false,
}: ContentManagerScheduledPipelineListProps): ReactElement {
  const { t, locale } = useTranslations();
  const now = useCalendarNow();
  const [layout, setLayout] = useState<PipelineLayout>("list");
  const effectiveLayout: PipelineLayout = forceList ? "list" : layout;
  const [upcomingDayCount, setUpcomingDayCount] = useState(
    SCHEDULED_PIPELINE_DEFAULT_UPCOMING_DAYS,
  );

  const timeline = useMemo(() => {
    const grouped = groupContentManagerScheduledPostsByDay(posts);
    const model = buildContentManagerScheduledUpcomingTimeline(
      now,
      grouped.sections,
      grouped.undated,
      upcomingDayCount,
    );
    if (!fromTodayOnly) {
      return model;
    }
    return {
      ...model,
      earlierSections: [],
    };
  }, [fromTodayOnly, now, posts, upcomingDayCount]);

  const firstHeaderDay =
    timeline.earlierSections[0]?.day ??
    timeline.upcomingDayBlocks[0]?.day ??
    timeline.laterSections[0]?.day;

  function dayHeader(day: Date): ReactElement {
    const isFirst = firstHeaderDay?.getTime() === day.getTime();
    return (
      <div
        className={`relative scroll-mt-4 pl-10 ${isFirst ? "" : "pt-2"}`}
      >
        <div
          className={`absolute left-2.5 top-1/2 h-3 w-3 -translate-y-1/2 rounded-full ${dayHeaderDotClass(day, now)}`}
          aria-hidden
        />
        <h3
          className={`text-[11px] font-bold uppercase tracking-widest ${dayHeaderTitleClass(day, now)}`}
        >
          {formatPipelineDayHeading(day, now, locale, t)}
        </h3>
      </div>
    );
  }

  const loadMoreControl =
    upcomingDayCount < SCHEDULED_PIPELINE_MAX_UPCOMING_DAYS ? (
      <div className={`relative pr-2 pt-2 ${effectiveLayout === "list" ? "pl-10" : ""}`}>
        <button
          type="button"
          onClick={() => {
            setUpcomingDayCount((c) =>
              Math.min(c + LOAD_MORE_DAY_STEP, SCHEDULED_PIPELINE_MAX_UPCOMING_DAYS),
            );
          }}
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-outline-variant/20 bg-surface-container-low/80 py-2.5 text-sm font-semibold text-on-surface transition-colors hover:border-outline-variant/35 hover:bg-surface-container"
        >
          <span className="material-symbols-outlined text-lg text-primary">
            expand_more
          </span>
          {t("content.pipelineLoadMoreDays")}
        </button>
      </div>
    ) : null;

  return (
    <div>
      {!forceList ? <div
        className="mb-3 flex items-center justify-end"
        role="group"
        aria-label={t("content.pipelineViewModeAria")}
      >
        <div className="flex items-center gap-1 rounded-xl border border-outline-variant/10 bg-surface-container-low p-1">
          {(
            [
              {
                id: "list" as const,
                label: t("content.pipelineViewList"),
                icon: "view_agenda",
              },
              {
                id: "columns" as const,
                label: t("content.pipelineViewColumns"),
                icon: "calendar_view_week",
              },
            ] as const
          ).map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => {
                setLayout(tab.id);
              }}
              className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                layout === tab.id
                  ? "bg-surface-container-high text-on-surface shadow-sm"
                  : "font-medium text-on-surface-variant hover:text-on-surface"
              }`}
            >
              <span className="material-symbols-outlined text-base">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>
      </div> : null}

      {effectiveLayout === "columns" ? (
        <ContentManagerScheduledPipelineColumns
          posts={posts}
          now={now}
          onOpenScheduledEditor={onOpenScheduledEditor}
          onRequestDeleteScheduled={onRequestDeleteScheduled}
          onPickSlot={onPickSlot}
        />
      ) : (
        <div className="workspace-dashboard-scroll pb-10 pt-1">
          <div className="relative space-y-3 before:absolute before:bottom-4 before:left-4 before:top-3 before:w-px before:bg-gradient-to-b before:from-primary/40 before:via-secondary/40 before:to-transparent">
            {timeline.earlierSections.map((section) => (
              <Fragment key={`earlier-${section.day.toISOString()}`}>
                {dayHeader(section.day)}
                <div className="space-y-3">
                  {section.posts.map(({ post, scheduledAt }) => (
                    <ContentManagerScheduledPipelineCard
                      key={post.id}
                      post={post}
                      scheduledAt={scheduledAt}
                      now={now}
                      onOpenEditor={onOpenScheduledEditor}
                      onRequestDeleteScheduled={onRequestDeleteScheduled}
                    />
                  ))}
                </div>
              </Fragment>
            ))}

            {timeline.upcomingDayBlocks.map((block) => (
              <Fragment key={`upcoming-${block.day.toISOString()}`}>
                {dayHeader(block.day)}
                <div className="space-y-3">
                  {block.items.map((item) =>
                    item.kind === "post" ? (
                      <ContentManagerScheduledPipelineCard
                        key={item.post.id}
                        post={item.post}
                        scheduledAt={item.scheduledAt}
                        now={now}
                        onOpenEditor={onOpenScheduledEditor}
                        onRequestDeleteScheduled={onRequestDeleteScheduled}
                      />
                    ) : item.kind === "empty" ? (
                      <ContentManagerScheduledEmptySlotRow
                        key={item.id}
                        at={item.at}
                        onPickSlot={onPickSlot}
                      />
                    ) : (
                      <ContentManagerScheduledCustomTimeRow
                        key={item.id}
                        day={item.day}
                        now={now}
                        onPickSlot={onPickSlot}
                      />
                    ),
                  )}
                </div>
              </Fragment>
            ))}

            {loadMoreControl}

            {timeline.laterSections.map((section) => (
              <Fragment key={`later-${section.day.toISOString()}`}>
                {dayHeader(section.day)}
                <div className="space-y-3">
                  {section.posts.map(({ post, scheduledAt }) => (
                    <ContentManagerScheduledPipelineCard
                      key={post.id}
                      post={post}
                      scheduledAt={scheduledAt}
                      now={now}
                      onOpenEditor={onOpenScheduledEditor}
                      onRequestDeleteScheduled={onRequestDeleteScheduled}
                    />
                  ))}
                </div>
              </Fragment>
            ))}

            {timeline.undated.length > 0 ? (
              <Fragment>
                <div className="relative scroll-mt-4 pl-10 pt-2">
                  <div
                    className="absolute left-2.5 top-1/2 h-3 w-3 -translate-y-1/2 rounded-full bg-outline-variant/30"
                    aria-hidden
                  />
                  <h3 className="text-[11px] font-bold uppercase tracking-widest text-on-surface-variant">
                    {t("content.pipelineTimePending")}
                  </h3>
                </div>
                <div className="space-y-3">
                  {timeline.undated.map((post) => (
                    <ContentManagerScheduledPipelineCard
                      key={post.id}
                      post={post}
                      scheduledAt={null}
                      now={now}
                      onOpenEditor={onOpenScheduledEditor}
                      onRequestDeleteScheduled={onRequestDeleteScheduled}
                    />
                  ))}
                </div>
              </Fragment>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
}
