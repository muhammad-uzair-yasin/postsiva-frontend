"use client";

import type { ReactElement } from "react";

import { useTranslations } from "@/lib/i18n/WorkspaceLocaleProvider";

interface CalendarWeekCustomTimeButtonProps {
  readonly disabled?: boolean;
  readonly onOpen: () => void;
}

export function CalendarWeekCustomTimeButton({
  disabled = false,
  onOpen,
}: CalendarWeekCustomTimeButtonProps): ReactElement {
  const { t } = useTranslations();

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onOpen}
      className="flex min-h-8 w-full min-w-0 items-center justify-center rounded-md border border-dashed border-secondary/30 bg-surface-container-low/50 px-1 py-1 text-center transition-colors hover:border-secondary/50 hover:bg-surface-container-low disabled:cursor-not-allowed disabled:opacity-40 sm:px-1.5"
    >
      <span className="material-symbols-outlined mr-0.5 text-[14px] text-secondary sm:mr-1">
        schedule
      </span>
      <span className="truncate text-[10px] font-semibold text-on-surface sm:text-[11px]">
        {t("postScheduler.calendar.customTime")}
      </span>
    </button>
  );
}
