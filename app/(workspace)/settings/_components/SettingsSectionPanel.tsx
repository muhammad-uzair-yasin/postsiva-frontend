"use client";

import type { ReactElement, ReactNode } from "react";

import { useTranslations } from "@/lib/i18n/WorkspaceLocaleProvider";

import { WORKSPACE_SIDEBAR_SUBPAGE_TITLE_CLASS } from "../../_components/shell/WorkspaceAccountRailPageLayout";

interface SettingsSectionPanelProps {
  title: string;
  beta?: boolean;
  /** When false, only children render (e.g. integration guide supplies its own headings). */
  showHeading?: boolean;
  children: ReactNode;
}

/**
 * Inner content for a settings subpage (layout provides scaffold + section tabs).
 */
export function SettingsSectionPanel({
  title,
  beta,
  showHeading = true,
  children,
}: SettingsSectionPanelProps): ReactElement {
  const { t } = useTranslations();

  return (
    <section aria-labelledby="settings-section-heading" className="space-y-6">
      {showHeading ? (
        <div className="flex flex-wrap items-center gap-2">
          <h2
            id="settings-section-heading"
            className={WORKSPACE_SIDEBAR_SUBPAGE_TITLE_CLASS}
          >
            {title}
          </h2>
          {beta ? (
            <span className="rounded border border-primary/20 bg-primary/10 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-widest text-primary">
              {t("settings.betaBadge")}
            </span>
          ) : null}
        </div>
      ) : null}
      {children}
    </section>
  );
}
