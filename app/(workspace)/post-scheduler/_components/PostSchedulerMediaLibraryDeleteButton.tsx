"use client";

import type { MouseEvent, ReactElement } from "react";

import { useTranslations } from "@/lib/i18n/WorkspaceLocaleProvider";

export function PostSchedulerMediaLibraryDeleteButton({
  embedded = false,
  disabled = false,
  disabledReason,
  onDelete,
}: {
  embedded?: boolean;
  disabled?: boolean;
  disabledReason?: string;
  onDelete: () => void;
}): ReactElement {
  const { t } = useTranslations();
  const sizeClass = embedded ? "h-7 w-7" : "h-8 w-8";
  const iconClass = embedded ? "text-[15px]" : "text-base";
  const label = disabled
    ? (disabledReason ?? t("postScheduler.mediaLibrary.deleteBlockedScheduled"))
    : t("postScheduler.mediaLibrary.deleteItem");

  const onClick = (event: MouseEvent<HTMLButtonElement>): void => {
    event.preventDefault();
    event.stopPropagation();
    if (disabled) {
      return;
    }
    onDelete();
  };

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      title={label}
      aria-label={label}
      className={`absolute left-2 top-2 z-[25] flex ${sizeClass} items-center justify-center rounded-full bg-surface/95 text-error shadow-lg ring-1 ring-white/20 opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100 hover:bg-error/15 disabled:cursor-not-allowed disabled:opacity-0 disabled:group-hover:opacity-70`}
    >
      <span className={`material-symbols-outlined ${iconClass}`} aria-hidden>
        delete
      </span>
    </button>
  );
}
