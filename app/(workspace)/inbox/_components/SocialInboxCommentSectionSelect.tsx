"use client";

import type { ReactElement } from "react";

import { useTranslations } from "@/lib/i18n/WorkspaceLocaleProvider";

import { useDropdownOpen } from "../../_hooks/useDropdownOpen";
import { WorkspaceShellContextDropdownTrigger } from "../../_components/shell/WorkspaceShellContextDropdownTrigger";
import type { InboxCommentsSection } from "./SocialInboxCommentSectionTabs";

type CategoryCountKey = Exclude<InboxCommentsSection, "all" | "unreplied">;

interface SocialInboxCommentSectionSelectProps {
  readonly section: InboxCommentsSection;
  readonly onSectionChange: (section: InboxCommentsSection) => void;
  readonly totalCount: number;
  readonly unrepliedCount: number;
  readonly categoryCounts: Record<CategoryCountKey, number>;
  readonly layout?: "toolbar" | "stacked";
}

function formatOptionLabel(
  label: string,
  count: number | undefined,
): string {
  if (count === undefined) {
    return label;
  }
  return `${label} (${count})`;
}

function InboxCommentSectionMenu({
  section,
  onSectionChange,
  options,
  onPick,
}: {
  readonly section: InboxCommentsSection;
  readonly onSectionChange: (section: InboxCommentsSection) => void;
  readonly options: readonly {
    key: InboxCommentsSection;
    label: string;
    count?: number;
  }[];
  readonly onPick?: () => void;
}): ReactElement {
  return (
    <ul className="max-h-72 overflow-y-auto py-1" role="listbox">
      {options.map((opt) => {
        const selected = section === opt.key;
        return (
          <li key={opt.key} role="none">
            <button
              type="button"
              role="option"
              aria-selected={selected}
              className={`flex w-full px-3 py-2.5 text-left text-sm transition-colors ${
                selected
                  ? "bg-primary/15 font-semibold text-primary"
                  : "text-on-surface hover:bg-surface-container"
              }`}
              onClick={() => {
                onSectionChange(opt.key);
                onPick?.();
              }}
            >
              {formatOptionLabel(opt.label, opt.count)}
            </button>
          </li>
        );
      })}
    </ul>
  );
}

export function SocialInboxCommentSectionSelect({
  section,
  onSectionChange,
  totalCount,
  unrepliedCount,
  categoryCounts,
  layout = "stacked",
}: SocialInboxCommentSectionSelectProps): ReactElement {
  const { t } = useTranslations();
  const { open, toggle, setOpen, containerRef } = useDropdownOpen();
  const options: readonly {
    key: InboxCommentsSection;
    label: string;
    count?: number;
  }[] = [
    { key: "all", label: t("inbox.messagesFilterAll"), count: totalCount },
    {
      key: "unreplied",
      label: t("inbox.tabsUnreplied"),
      count: unrepliedCount,
    },
    { key: "lead", label: t("inbox.categoryLead"), count: categoryCounts.lead },
    {
      key: "question",
      label: t("inbox.categoryQuestion"),
      count: categoryCounts.question,
    },
    {
      key: "complaint",
      label: t("inbox.categoryComplaint"),
      count: categoryCounts.complaint,
    },
    { key: "spam", label: t("inbox.categorySpam"), count: categoryCounts.spam },
    {
      key: "positive",
      label: t("inbox.categoryPositive"),
      count: categoryCounts.positive,
    },
    {
      key: "negative",
      label: t("inbox.categoryNegative"),
      count: categoryCounts.negative,
    },
  ];

  const match = options.find((opt) => opt.key === section);
  const currentTitle = match
    ? formatOptionLabel(match.label, match.count)
    : t("inbox.messagesFilterAll");

  const closeMenu = (): void => {
    setOpen(false);
  };

  const toolbarShell = (
    <div
      ref={containerRef}
      className="relative w-full min-w-[14rem] shrink-0 sm:min-w-[240px] sm:max-w-[320px]"
    >
      <WorkspaceShellContextDropdownTrigger
        icon={
          <span className="flex h-full w-full items-center justify-center bg-primary-container text-on-primary-container">
            <span className="material-symbols-outlined text-[20px]" aria-hidden>
              forum
            </span>
          </span>
        }
        title={currentTitle}
        subtitle={t("inbox.messagesFilterLabel")}
        open={open}
        onClick={toggle}
        ariaLabel={t("inbox.messagesFilterLabel")}
        className="w-full min-w-0 max-w-none sm:max-w-[320px]"
      />
      {open ? (
        <div className="absolute left-0 top-[calc(100%+6px)] z-[80] w-full min-w-full rounded-xl border border-outline-variant/20 bg-surface-container-high py-1 shadow-xl">
          <InboxCommentSectionMenu
            section={section}
            options={options}
            onSectionChange={onSectionChange}
            onPick={closeMenu}
          />
        </div>
      ) : null}
    </div>
  );

  const stackedShell = (
    <div ref={containerRef} className="relative min-w-[12rem] max-w-md shrink-0">
      <button
        type="button"
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-label={t("inbox.messagesFilterLabel")}
        className="flex w-full items-center justify-between gap-2 rounded-xl border border-outline-variant/25 bg-surface-container-high py-2.5 pl-3 pr-2 text-sm font-semibold text-on-surface shadow-sm transition-colors hover:border-primary/40"
        onClick={toggle}
      >
        <span className="truncate">{currentTitle}</span>
        <span
          className={`material-symbols-outlined shrink-0 text-[20px] text-on-surface-variant ${open ? "rotate-180" : ""}`}
          aria-hidden
        >
          expand_more
        </span>
      </button>
      {open ? (
        <div className="absolute left-0 top-[calc(100%+6px)] z-[80] w-full rounded-xl border border-outline-variant/20 bg-surface-container-high py-1 shadow-xl">
          <InboxCommentSectionMenu
            section={section}
            options={options}
            onSectionChange={onSectionChange}
            onPick={closeMenu}
          />
        </div>
      ) : null}
    </div>
  );

  if (layout === "toolbar") {
    return toolbarShell;
  }

  return (
    <div className="shrink-0 border-b border-outline-variant/10 bg-surface px-3 py-3 sm:px-4 md:px-5">
      <label className="flex max-w-md flex-col gap-1.5">
        <span className="text-[10px] font-extrabold uppercase tracking-[0.12em] text-on-surface-variant">
          {t("inbox.messagesFilterLabel")}
        </span>
        {stackedShell}
      </label>
    </div>
  );
}
