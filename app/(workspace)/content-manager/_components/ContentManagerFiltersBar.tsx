"use client";

import { motion } from "framer-motion";
import type { ReactElement } from "react";

import { useTranslations } from "@/lib/i18n/WorkspaceLocaleProvider";

import type { ContentManagerTab } from "../_types/contentManagerTypes";

const TAB_KEYS: Record<ContentManagerTab, string> = {
  published: "content.tabsPublished",
  scheduled: "content.tabsScheduled",
  draft: "content.tabsDrafts",
};

interface ContentManagerFiltersBarProps {
  readonly tab: ContentManagerTab;
  readonly onTabChange: (t: ContentManagerTab) => void;
  /** Show the plan-gated Drafts tab. Scheduled lives on the Calendar page. */
  readonly showDraftTab?: boolean;
}

export function ContentManagerFiltersBar({
  tab,
  onTabChange,
  showDraftTab = false,
}: ContentManagerFiltersBarProps): ReactElement | null {
  const { t } = useTranslations();
  const tabIds: ContentManagerTab[] = showDraftTab
    ? ["published", "draft"]
    : ["published"];
  // Single tab → nothing to switch between; hide the bar.
  if (tabIds.length < 2) {
    return null;
  }
  const tabs = tabIds.map((id) => ({ id, label: t(TAB_KEYS[id]) }));

  return (
    <nav aria-label={t("content.tabsAria")}>
      <div className="relative flex w-full max-w-xs gap-1 rounded-2xl bg-surface-container-high/85 p-1 ring-1 ring-outline-variant/15 shadow-inner sm:max-w-sm md:max-w-[32rem]">
        {tabs.map((tabItem) => (
          <button
            key={tabItem.id}
            type="button"
            onClick={() => {
              onTabChange(tabItem.id);
            }}
            className={`relative flex-1 rounded-xl px-2 py-3 text-sm font-bold transition-colors sm:px-4 ${
              tab === tabItem.id
                ? "text-on-primary"
                : "text-on-surface-variant hover:text-on-surface"
            }`}
          >
            {tab === tabItem.id ? (
              <motion.span
                layoutId="contentManagerTabPill"
                className="absolute inset-0 rounded-xl bg-gradient-to-br from-primary via-primary to-primary-container shadow-[0_4px_20px_-4px_rgba(107,73,216,0.65)]"
                transition={{ type: "spring", stiffness: 440, damping: 34 }}
              />
            ) : null}
            <span className="relative z-10">{tabItem.label}</span>
          </button>
        ))}
      </div>
    </nav>
  );
}
