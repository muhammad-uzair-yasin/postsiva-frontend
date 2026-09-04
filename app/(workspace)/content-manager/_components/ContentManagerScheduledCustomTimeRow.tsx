"use client";

import { useCallback, useState, type ReactElement } from "react";

import { useTranslations } from "@/lib/i18n/WorkspaceLocaleProvider";

import { useWorkspaceComposerModal } from "../../_components/WorkspaceComposerModalProvider";
import { ContentManagerScheduledDateTimePickerModal } from "./ContentManagerScheduledDateTimePickerModal";

interface ContentManagerScheduledCustomTimeRowProps {
  day: Date;
  now: Date;
  /** Timeline list (default) vs compact calendar column cell. */
  variant?: "timeline" | "column";
  /** Override button label in column mode (default: short “Custom”). */
  columnLabel?: string;
  /** When set (e.g. Schedule button picker), use instead of opening the composer. */
  onPickSlot?: (at: Date) => void;
}

export function ContentManagerScheduledCustomTimeRow({
  day,
  now,
  variant = "timeline",
  columnLabel,
  onPickSlot,
}: ContentManagerScheduledCustomTimeRowProps): ReactElement {
  const { t } = useTranslations();
  const { openComposer } = useWorkspaceComposerModal();
  const [pickerOpen, setPickerOpen] = useState(false);
  const isColumn = variant === "column";

  const handleConfirm = useCallback(
    (at: Date): void => {
      setPickerOpen(false);
      if (onPickSlot) {
        onPickSlot(at);
        return;
      }
      openComposer(at);
    },
    [onPickSlot, openComposer],
  );

  return (
    <article className={isColumn ? "relative" : "relative pl-10"}>
      {isColumn ? null : (
        <div
          className="absolute left-3.5 top-4 h-1.5 w-1.5 rounded-full bg-secondary/50"
          aria-hidden
        />
      )}
      <button
        type="button"
        onClick={() => {
          setPickerOpen(true);
        }}
        className={
          isColumn
            ? "flex min-h-8 w-full min-w-0 items-center justify-center rounded-md border border-dashed border-secondary/30 bg-surface-container-low/50 px-1 py-1 text-center transition-colors hover:border-secondary/50 hover:bg-surface-container-low sm:px-1.5"
            : "flex min-h-11 w-full flex-col gap-1 rounded-lg border border-dashed border-secondary/30 bg-surface-container-low/50 px-3 py-2.5 text-left transition-colors hover:border-secondary/50 hover:bg-surface-container-low"
        }
      >
        <span
          className={
            isColumn
              ? "truncate text-[10px] font-semibold text-on-surface sm:text-[11px]"
              : "text-sm font-semibold text-on-surface"
          }
        >
          {isColumn
            ? (columnLabel ?? t("content.pipelineCustomShort"))
            : t("content.pipelineCustomDateTime")}
        </span>
        {isColumn ? null : (
          <span className="text-[11px] text-on-surface-variant">
            {t("content.pipelineCustomDateTimeHint")}
          </span>
        )}
      </button>

      <ContentManagerScheduledDateTimePickerModal
        open={pickerOpen}
        day={day}
        now={now}
        onClose={() => {
          setPickerOpen(false);
        }}
        onConfirm={handleConfirm}
      />
    </article>
  );
}
