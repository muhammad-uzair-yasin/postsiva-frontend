"use client";

import { motion } from "framer-motion";
import type { ReactElement } from "react";

import { useTranslations } from "@/lib/i18n/WorkspaceLocaleProvider";

export type InboxCommentsSection =
  | "all"
  | "unreplied"
  | "positive"
  | "negative"
  | "spam"
  | "question"
  | "complaint"
  | "lead";

type CategoryCountKey = Exclude<InboxCommentsSection, "all" | "unreplied">;

interface SocialInboxCommentSectionTabsProps {
  readonly section: InboxCommentsSection;
  readonly onSectionChange: (section: InboxCommentsSection) => void;
  readonly totalCount: number;
  readonly unrepliedCount: number;
  readonly categoryCounts: Record<CategoryCountKey, number>;
}

export function SocialInboxCommentSectionTabs({
  section,
  onSectionChange,
  totalCount,
  unrepliedCount,
  categoryCounts,
}: SocialInboxCommentSectionTabsProps): ReactElement {
  const { t } = useTranslations();
  const tabs: readonly { key: InboxCommentsSection; label: string; count?: number }[] = [
    { key: "all", label: t("inbox.tabsAll"), count: totalCount },
    { key: "unreplied", label: t("inbox.tabsUnreplied"), count: unrepliedCount },
    { key: "lead", label: t("inbox.categoryLead"), count: categoryCounts.lead },
    { key: "question", label: t("inbox.categoryQuestion"), count: categoryCounts.question },
    { key: "complaint", label: t("inbox.categoryComplaint"), count: categoryCounts.complaint },
    { key: "spam", label: t("inbox.categorySpam"), count: categoryCounts.spam },
    { key: "positive", label: t("inbox.categoryPositive"), count: categoryCounts.positive },
    { key: "negative", label: t("inbox.categoryNegative"), count: categoryCounts.negative },
  ];

  return (
    <div
      className="shrink-0 border-b border-outline-variant/10 bg-surface py-3 pr-3 sm:pr-4 md:pr-5"
      role="tablist"
      aria-label={t("inbox.tabsAria")}
    >
      <div className="relative flex w-full flex-wrap gap-1 overflow-x-auto rounded-2xl bg-surface-container-high/85 p-1 ring-1 ring-outline-variant/15 shadow-inner sm:overflow-visible">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            type="button"
            role="tab"
            aria-selected={section === tab.key}
            className={`relative shrink-0 rounded-xl px-3 py-2.5 text-xs font-bold transition-colors ${
              section === tab.key
                ? "text-on-primary"
                : "text-on-surface-variant hover:text-on-surface"
            }`}
            onClick={() => {
              onSectionChange(tab.key);
            }}
          >
            {section === tab.key ? (
              <motion.span
                layoutId="inboxCommentTabPill"
                className="absolute inset-0 rounded-xl bg-gradient-to-br from-primary via-primary to-primary-container shadow-[0_4px_20px_-4px_rgba(107,73,216,0.65)]"
                transition={{ type: "spring", stiffness: 440, damping: 34 }}
              />
            ) : null}
            <span className="relative z-10 inline-flex items-center justify-center gap-1">
              {tab.label}
              {(tab.count ?? 0) > 0 ? (
                <span
                  className={`rounded-md px-1.5 py-px text-[10px] font-extrabold ${
                    section === tab.key
                      ? "bg-on-primary/15"
                      : tab.key === "unreplied"
                        ? "bg-secondary/20 text-secondary"
                        : "bg-surface-container/60"
                  }`}
                >
                  {tab.count}
                </span>
              ) : null}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
