"use client";

import type { ReactElement, ReactNode } from "react";

interface WorkspaceShellContextDropdownTriggerProps {
  readonly icon: ReactNode;
  readonly title: string;
  readonly subtitle: string;
  readonly open: boolean;
  readonly onClick: () => void;
  readonly ariaLabel: string;
  readonly className?: string;
  readonly size?: "default" | "large";
  readonly titleFirst?: boolean;
}

/** Publer-style two-line context switcher (workspace / social account). */
export function WorkspaceShellContextDropdownTrigger({
  icon,
  title,
  subtitle,
  open,
  onClick,
  ariaLabel,
  className,
  size = "default",
  titleFirst = false,
}: WorkspaceShellContextDropdownTriggerProps): ReactElement {
  const isLarge = size === "large";
  const textBlock = (
    <span className="min-w-0 flex-1 leading-tight">
      <span
        className={[
          "block truncate font-semibold text-on-surface",
          isLarge ? "text-base sm:text-[17px]" : "text-sm",
        ].join(" ")}
      >
        {title}
      </span>
      <span
        className={[
          "hidden truncate text-on-surface-variant sm:block",
          isLarge ? "text-xs" : "text-[11px]",
        ].join(" ")}
      >
        {subtitle}
      </span>
    </span>
  );
  const iconWrap = (
    <span
      className={[
        "flex shrink-0 items-center justify-center overflow-hidden rounded-md",
        isLarge ? "h-10 w-10 sm:h-11 sm:w-11" : "h-8 w-8",
      ].join(" ")}
    >
      {icon}
    </span>
  );
  const chevron = (
    <span
      className={[
        "material-symbols-outlined shrink-0 text-on-surface-variant",
        isLarge ? "text-xl" : "text-lg",
      ].join(" ")}
    >
      expand_more
    </span>
  );

  return (
    <button
      type="button"
      onClick={onClick}
      aria-expanded={open}
      aria-label={ariaLabel}
      className={[
        "flex min-w-0 items-center rounded-lg border border-outline-variant/20 bg-surface-container-low text-left shadow-sm transition-colors hover:bg-surface-container-high",
        isLarge
          ? "gap-2.5 px-3 py-2 sm:gap-3 sm:px-4 sm:py-2.5"
          : "gap-2 px-2 py-1.5 sm:gap-2.5 sm:px-3 sm:py-2",
        className ?? "max-w-[min(100vw-12rem,220px)] sm:max-w-[min(100vw-10rem,240px)]",
      ].join(" ")}
    >
      {titleFirst ? (
        <>
          {textBlock}
          {iconWrap}
          {chevron}
        </>
      ) : (
        <>
          {iconWrap}
          {textBlock}
          {chevron}
        </>
      )}
    </button>
  );
}
