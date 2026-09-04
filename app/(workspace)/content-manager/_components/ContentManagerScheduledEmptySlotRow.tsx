"use client";

import type { ReactElement } from "react";

import { useTranslations } from "@/lib/i18n/WorkspaceLocaleProvider";

import { useWorkspaceComposerModal } from "../../_components/WorkspaceComposerModalProvider";

interface ContentManagerScheduledEmptySlotRowProps {
  at: Date;
  /** Timeline list (default) vs compact calendar column cell. */
  variant?: "timeline" | "column";
  /** When set (e.g. Schedule button picker), use instead of opening the composer. */
  onPickSlot?: (at: Date) => void;
}

function formatListTime(d: Date): string {
  return d.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

export function ContentManagerScheduledEmptySlotRow({
  at,
  variant = "timeline",
  onPickSlot,
}: ContentManagerScheduledEmptySlotRowProps): ReactElement {
  const { t } = useTranslations();
  const { openComposer } = useWorkspaceComposerModal();
  const isColumn = variant === "column";

  return (
    <article className={isColumn ? "relative" : "relative pl-10"}>
      {isColumn ? null : (
        <div
          className="absolute left-3.5 top-4 h-1.5 w-1.5 rounded-full bg-outline-variant/40"
          aria-hidden
        />
      )}
      <button
        type="button"
        onClick={() => {
          if (onPickSlot) {
            onPickSlot(at);
            return;
          }
          openComposer(at);
        }}
        className={
          isColumn
            ? "flex min-h-8 w-full min-w-0 items-center justify-center rounded-md border border-dashed border-outline-variant/25 bg-surface-container-low/60 px-1 py-1 text-center text-[10px] font-semibold text-on-surface-variant transition-colors hover:border-secondary/30 hover:bg-surface-container-low hover:text-on-surface sm:justify-start sm:px-1.5 sm:text-left sm:text-[11px]"
            : "flex min-h-11 w-full items-center rounded-lg border border-dashed border-outline-variant/25 bg-surface-container-low/60 px-3 py-2.5 text-left text-sm font-semibold text-on-surface-variant transition-colors hover:border-secondary/30 hover:bg-surface-container-low hover:text-on-surface"
        }
      >
        {isColumn ? (
          <span className="truncate text-primary">{formatListTime(at)}</span>
        ) : (
          <>
            <span className="text-primary">{t("content.pipelineNewSlot")}</span>
            <span className="ml-1.5 text-[11px] font-medium text-on-surface-variant/80">
              {formatListTime(at)}
            </span>
          </>
        )}
      </button>
    </article>
  );
}
