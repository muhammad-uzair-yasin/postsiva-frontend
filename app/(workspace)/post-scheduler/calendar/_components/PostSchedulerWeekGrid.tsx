"use client";

import { useMemo, useState } from "react";

import { useWorkspaceComposerModal } from "@/app/(workspace)/_components/WorkspaceComposerModalProvider";
import { ContentManagerScheduledDateTimePickerModal } from "@/app/(workspace)/content-manager/_components/ContentManagerScheduledDateTimePickerModal";
import { useTranslations } from "@/lib/i18n/WorkspaceLocaleProvider";

import type { CalendarPost } from "../_types/calendarTypes";
import {
  addDays,
  formatHourLabel,
  isSameDay,
  startOfDay,
  startOfWeekMonday,
  WEEK_VIEW_SLOT_ROW_CLASS,
} from "../_utils/postSchedulerCalendarWeekUtils";
import {
  buildCalendarWeekTimeGrid,
  type CalendarWeekTimeCell,
} from "../_utils/buildCalendarWeekDayRows";
import { CalendarWeekCustomTimeButton } from "./CalendarWeekCustomTimeButton";
import { CalendarWeekPostCard } from "./CalendarWeekPostCard";
import { PostSchedulerWeekGridNav } from "./PostSchedulerWeekGridNav";
import { useCalendarNow } from "../_hooks/useCalendarNow";

interface WeekTimePickerState {
  day: Date;
  initial: Date | null;
}

interface Props {
  weekStart: Date;
  posts: CalendarPost[];
  onWeekStartChange: (date: Date) => void;
  onOpen: (post: CalendarPost) => void;
  onRequestDelete?: (post: CalendarPost) => void;
  onRequestRetry?: (post: CalendarPost) => void;
  onReschedulePost?: (postId: string, target: Date) => void;
  onPickSlot?: (at: Date) => void;
  onRefresh?: () => void;
  isRefreshing?: boolean;
  savingIds?: ReadonlySet<string>;
  retryingIds?: ReadonlySet<string>;
  embedded?: boolean;
}

function WeekTimeCell({
  cell,
  isToday,
  savingIds,
  onRequestRetry,
  retryingIds,
  onOpen,
  onRequestDelete,
  onOpenSlot,
  onDragOver,
  onDrop,
  createLabel,
}: {
  readonly cell: CalendarWeekTimeCell;
  readonly isToday: boolean;
  readonly savingIds?: ReadonlySet<string>;
  readonly retryingIds?: ReadonlySet<string>;
  readonly onOpen: (post: CalendarPost) => void;
  readonly onRequestDelete?: (post: CalendarPost) => void;
  readonly onRequestRetry?: (post: CalendarPost) => void;
  readonly onOpenSlot: (at: Date) => void;
  readonly onDragOver: (event: React.DragEvent) => void;
  readonly onDrop: (event: React.DragEvent, at: Date) => void;
  readonly createLabel: string;
}): React.ReactElement {
  const cellClass = [
    WEEK_VIEW_SLOT_ROW_CLASS,
    "relative border-r border-outline-variant/30 px-1.5 py-1.5 sm:px-2",
    isToday ? "bg-primary-container/12" : "bg-surface-container",
  ].join(" ");

  if (cell.kind === "posts") {
    return (
      <div className={`${cellClass} !h-auto items-start`}>
        <div className="flex w-full flex-col gap-1">
          {cell.posts.map((post) => (
            <CalendarWeekPostCard
              key={post.id}
              post={post}
              canDrag={post.postKind !== "published"}
              saving={savingIds?.has(post.id) ?? false}
              retrying={retryingIds?.has(post.id) ?? false}
              onOpen={onOpen}
              onRequestDelete={onRequestDelete}
              onRequestRetry={onRequestRetry}
            />
          ))}
        </div>
      </div>
    );
  }

  if (cell.kind === "empty") {
    return (
      <button
        type="button"
        onClick={() => onOpenSlot(cell.at)}
        onDragOver={onDragOver}
        onDrop={(event) => onDrop(event, cell.at)}
        aria-label={createLabel}
        className={`group ${cellClass} w-full text-left transition-colors hover:bg-primary-container/10`}
      >
        <span className="absolute right-1.5 top-1.5 flex h-7 w-7 items-center justify-center rounded-full border border-primary/25 bg-primary-container/25 text-primary opacity-0 transition-opacity group-hover:opacity-100">
          <span className="material-symbols-outlined text-base">add</span>
        </span>
      </button>
    );
  }

  return <div className={`${cellClass} bg-surface-container-low/60`} aria-hidden />;
}

export function PostSchedulerWeekGrid({
  weekStart,
  posts,
  onWeekStartChange,
  onOpen,
  onRequestDelete,
  onRequestRetry,
  onReschedulePost,
  onPickSlot,
  onRefresh,
  isRefreshing,
  savingIds,
  retryingIds,
  embedded = false,
}: Props) {
  const { openComposer } = useWorkspaceComposerModal();
  const { t } = useTranslations();
  const now = useCalendarNow();
  const today = startOfDay(now);
  const openSlot = onPickSlot ?? openComposer;
  const [timePicker, setTimePicker] = useState<WeekTimePickerState | null>(null);

  const openTimePicker = (day: Date, initial: Date | null = null): void => {
    setTimePicker({ day: startOfDay(day), initial });
  };

  const confirmTimePicker = (at: Date): void => {
    setTimePicker(null);
    openSlot(at);
  };

  const handleDropOnSlot = (event: React.DragEvent, at: Date) => {
    const postId = event.dataTransfer.getData("text/calendar-post-id");
    if (!postId || !onReschedulePost) return;
    event.preventDefault();
    event.stopPropagation();
    onReschedulePost(postId, at);
  };

  const handleSlotDragOver = (event: React.DragEvent) => {
    if (!onReschedulePost) return;
    if (event.dataTransfer.types.includes("text/calendar-post-id")) {
      event.preventDefault();
      event.dataTransfer.dropEffect = "move";
    }
  };

  const grid = useMemo(
    () => buildCalendarWeekTimeGrid(weekStart, now, posts),
    [now, posts, weekStart],
  );

  return (
    <div
      className={
        embedded
          ? "flex min-h-0 flex-1 flex-col overflow-hidden bg-surface-container"
          : "flex h-full min-h-0 flex-1 flex-col overflow-hidden rounded-xl border border-outline-variant/35 bg-surface-container shadow-md"
      }
    >
      {!embedded ? (
        <PostSchedulerWeekGridNav
          weekStart={weekStart}
          onPrevWeek={() => onWeekStartChange(addDays(weekStart, -7))}
          onNextWeek={() => onWeekStartChange(addDays(weekStart, 7))}
          onToday={() => onWeekStartChange(startOfWeekMonday(now))}
          onRefresh={onRefresh}
          isRefreshing={isRefreshing}
        />
      ) : null}

      <div className="grid shrink-0 grid-cols-[3.25rem_repeat(7,minmax(0,1fr))] border-b border-outline-variant/25 bg-surface sm:grid-cols-[4rem_repeat(7,minmax(0,1fr))]">
        <div className="border-r border-outline-variant/25 bg-surface" aria-hidden />
        {grid.days.map((day) => {
          const isToday = isSameDay(day, today);
          const dayLabel = `${day.toLocaleDateString([], { weekday: "long" })} ${day.getDate()}`;
          return (
            <header
              key={`head-${day.toISOString()}`}
              className={[
                "border-r border-outline-variant/25 px-2 py-3 text-center text-sm last:border-r-0",
                isToday
                  ? "border-b-2 border-b-primary font-semibold text-primary"
                  : "border-b border-b-transparent font-medium text-on-surface-variant",
              ].join(" ")}
            >
              {dayLabel}
            </header>
          );
        })}
      </div>

      <div className="grid shrink-0 grid-cols-[3.25rem_repeat(7,minmax(0,1fr))] border-b border-outline-variant/25 bg-surface sm:grid-cols-[4rem_repeat(7,minmax(0,1fr))]">
        <div className="border-r border-outline-variant/25 bg-surface" aria-hidden />
        {grid.days.map((day) => {
          const dayStart = startOfDay(day);
          const isPastDay = dayStart.getTime() < today.getTime();
          return (
            <div
              key={`custom-${day.toISOString()}`}
              className="border-r border-outline-variant/25 px-1.5 py-1.5 last:border-r-0 sm:px-2"
            >
              <CalendarWeekCustomTimeButton
                disabled={isPastDay}
                onOpen={() => openTimePicker(day)}
              />
            </div>
          );
        })}
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden bg-surface-container-low/40">
        <div className="grid grid-cols-[3.25rem_repeat(7,minmax(0,1fr))] sm:grid-cols-[4rem_repeat(7,minmax(0,1fr))]">
          {grid.hours.map((hour, hourIndex) => (
            <div key={`row-${hour}`} className="contents">
              <div
                className={`${WEEK_VIEW_SLOT_ROW_CLASS} sticky left-0 z-[1] border-r border-outline-variant/30 bg-surface-container-high px-1.5 pt-2 text-[11px] font-bold leading-none text-on-surface sm:px-2 sm:text-xs`}
              >
                {formatHourLabel(hour)}
              </div>
              {grid.days.map((day, dayIndex) => {
                const cell = grid.cells[dayIndex]?.[hourIndex];
                if (!cell) return null;
                return (
                  <WeekTimeCell
                    key={`${day.toISOString()}-${hour}`}
                    cell={cell}
                    isToday={isSameDay(day, today)}
                    savingIds={savingIds}
                    retryingIds={retryingIds}
                    onOpen={onOpen}
                    onRequestDelete={onRequestDelete}
                    onRequestRetry={onRequestRetry}
                    onOpenSlot={openSlot}
                    onDragOver={handleSlotDragOver}
                    onDrop={handleDropOnSlot}
                    createLabel={t("postScheduler.calendar.createInSlot")}
                  />
                );
              })}
            </div>
          ))}
        </div>
      </div>

      <ContentManagerScheduledDateTimePickerModal
        open={timePicker !== null}
        day={timePicker?.day ?? today}
        now={now}
        initialValue={timePicker?.initial ?? null}
        onClose={() => setTimePicker(null)}
        onConfirm={confirmTimePicker}
      />
    </div>
  );
}
