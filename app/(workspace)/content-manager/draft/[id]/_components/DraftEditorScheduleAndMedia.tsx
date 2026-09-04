"use client";

import { useMemo, useState } from "react";

import { useTranslations } from "@/lib/i18n/WorkspaceLocaleProvider";
import { ContentManagerScheduledDateTimePickerModal } from "@/app/(workspace)/content-manager/_components/ContentManagerScheduledDateTimePickerModal";

function formatScheduleLabel(isoUtc: string, locale: string): string {
  const ms = new Date(isoUtc).getTime();
  if (Number.isNaN(ms)) {
    return "";
  }
  const date = new Date(ms);
  const dateLabel = date.toLocaleDateString(locale, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
  const timeLabel = date.toLocaleTimeString(locale, {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
  return `${dateLabel}, ${timeLabel}`;
}

function formatSchedulePillLabel(isoUtc: string, locale: string): string {
  const ms = new Date(isoUtc).getTime();
  if (Number.isNaN(ms)) {
    return "";
  }
  const date = new Date(ms);
  const dateLabel = date.toLocaleDateString(locale, {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
  const timeLabel = date.toLocaleTimeString(locale, {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
  return `${dateLabel}, ${timeLabel}`;
}

interface DraftEditorScheduleSectionProps {
  disabled: boolean;
  scheduleBusy: boolean;
  scheduleError: string | null;
  onSchedule: (isoUtc: string) => void;
  /** When editing a scheduled post, pre-fill the current queue time. */
  initialSelectedIsoUtc?: string | null;
  /** Dense datetime pill for the compact scheduled editor. */
  compact?: boolean;
}

export function DraftEditorScheduleAndMedia({
  disabled,
  scheduleBusy,
  scheduleError,
  onSchedule,
  initialSelectedIsoUtc = null,
  compact = false,
}: DraftEditorScheduleSectionProps): React.ReactElement {
  const { t, locale } = useTranslations();
  const [pickerOpen, setPickerOpen] = useState(false);
  const [selectedIsoUtc, setSelectedIsoUtc] = useState<string | null>(() =>
    initialSelectedIsoUtc ?? null,
  );
  const now = useMemo(() => new Date(), [pickerOpen]);
  const initialValue = useMemo(() => {
    if (!selectedIsoUtc) {
      return null;
    }
    const d = new Date(selectedIsoUtc);
    return Number.isNaN(d.getTime()) ? null : d;
  }, [selectedIsoUtc]);
  const pickerDay = initialValue ?? now;

  const dateTimePicker = (
    <ContentManagerScheduledDateTimePickerModal
      open={pickerOpen}
      day={pickerDay}
      now={now}
      initialValue={initialValue}
      body={t("content.draftScheduleHint")}
      confirmLabel={t("content.actionConfirm")}
      onClose={() => {
        setPickerOpen(false);
      }}
      onConfirm={(at) => {
        setSelectedIsoUtc(at.toISOString());
        setPickerOpen(false);
      }}
    />
  );

  if (compact) {
    return (
      <div className="flex min-w-0 flex-col items-end gap-1">
        <div className="flex flex-wrap items-center justify-end gap-1.5">
          <button
            type="button"
            disabled={disabled || scheduleBusy}
            onClick={() => {
              setPickerOpen(true);
            }}
            className="inline-flex max-w-full items-center gap-1.5 rounded-full border border-outline-variant/25 bg-surface-container-low px-3 py-1.5 text-xs font-semibold text-on-surface transition-colors hover:border-secondary/40 hover:bg-surface-container disabled:opacity-60"
          >
            <span className="material-symbols-outlined text-[16px] text-on-surface-variant">
              schedule
            </span>
            <span className="truncate">
              {selectedIsoUtc
                ? formatSchedulePillLabel(selectedIsoUtc, locale)
                : t("content.draftScheduleNoTime")}
            </span>
            <span className="material-symbols-outlined text-[16px] text-on-surface-variant">
              expand_more
            </span>
          </button>
          <button
            type="button"
            disabled={disabled || scheduleBusy || !selectedIsoUtc}
            onClick={() => {
              if (!selectedIsoUtc) {
                return;
              }
              onSchedule(selectedIsoUtc);
            }}
            className="shrink-0 rounded-full bg-secondary-container px-3 py-1.5 text-xs font-bold text-on-secondary-container transition-opacity hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {scheduleBusy
              ? t("content.draftScheduleSubmitting")
              : t("content.draftScheduleSubmit")}
          </button>
        </div>
        {scheduleError ? (
          <p className="max-w-[16rem] text-right text-[11px] text-error" role="alert">
            {scheduleError}
          </p>
        ) : null}
        {dateTimePicker}
      </div>
    );
  }

  return (
    <div className="space-y-4 rounded-2xl border border-outline-variant/10 bg-surface-container-low/50 p-4 transition-[border-color,box-shadow] duration-300 hover:border-outline-variant/20 hover:shadow-[0_8px_32px_-12px_rgba(0,0,0,0.45)]">
      <div>
        <p className="mb-2 text-sm font-semibold text-on-surface">
          {t("content.draftScheduleTitle")}
        </p>
        <div
          className={`rounded-xl border bg-surface-container-low px-4 py-3 transition-all duration-300 ${
            selectedIsoUtc
              ? "border-secondary/35 shadow-[0_0_0_1px_rgba(1,175,148,0.2),0_12px_40px_-16px_rgba(1,175,148,0.15)]"
              : "border-outline-variant/15"
          }`}
        >
          <p className="text-xs font-medium uppercase tracking-wide text-on-surface-variant">
            {t("content.draftScheduleSelectedTime")}
          </p>
          <p
            key={selectedIsoUtc ?? "empty"}
            className={`mt-1 text-base font-semibold text-on-surface ${
              selectedIsoUtc ? "draft-schedule-time-reveal" : ""
            }`}
          >
            {selectedIsoUtc
              ? formatScheduleLabel(selectedIsoUtc, locale)
              : t("content.draftScheduleNoTime")}
          </p>
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <button
            type="button"
            disabled={disabled || scheduleBusy}
            onClick={() => {
              setPickerOpen(true);
            }}
            className="shrink-0 rounded-xl border border-secondary/35 bg-secondary-container/40 px-5 py-2.5 text-sm font-bold text-on-secondary-container transition-all duration-200 hover:bg-secondary-container/60 hover:shadow-[0_4px_20px_-4px_rgba(1,175,148,0.45)] active:scale-[0.97] disabled:opacity-60"
          >
            {t("content.draftScheduleChooseTime")}
          </button>
          <button
            type="button"
            disabled={disabled || scheduleBusy || !selectedIsoUtc}
            onClick={() => {
              if (!selectedIsoUtc) {
                return;
              }
              onSchedule(selectedIsoUtc);
            }}
            className="shrink-0 rounded-xl bg-secondary-container px-6 py-2.5 text-sm font-bold text-on-secondary-container transition-all duration-200 hover:brightness-110 hover:shadow-[0_6px_24px_-6px_rgba(1,175,148,0.5)] active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {scheduleBusy ? t("content.draftScheduleSubmitting") : t("content.draftScheduleSubmit")}
          </button>
          {selectedIsoUtc ? (
            <button
              type="button"
              disabled={disabled || scheduleBusy}
              onClick={() => {
                setSelectedIsoUtc(null);
              }}
              className="shrink-0 rounded-xl border border-outline-variant/25 px-5 py-2.5 text-sm font-semibold text-on-surface transition-all duration-200 hover:border-outline-variant/40 hover:bg-surface-container active:scale-[0.97] disabled:opacity-60"
            >
              {t("content.draftScheduleClear")}
            </button>
          ) : null}
        </div>
        <p className="mt-2 text-xs text-on-surface-variant">
          {t("content.draftScheduleHint")}
        </p>
        {scheduleError ? (
          <p className="mt-2 text-sm text-error" role="alert">
            {scheduleError}
          </p>
        ) : null}
      </div>

      {dateTimePicker}
    </div>
  );
}
