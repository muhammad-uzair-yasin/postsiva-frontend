"use client";

import type { ReactElement } from "react";

import { usePlanFeature } from "@/lib/billing/BillingContext";
import { useTranslations } from "@/lib/i18n/WorkspaceLocaleProvider";

import { useWorkspaceComposerModal } from "../WorkspaceComposerModalProvider";

interface WorkspaceSidebarCreateButtonProps {
  readonly showExpandedContent: boolean;
}

export function WorkspaceSidebarCreateButton({
  showExpandedContent,
}: WorkspaceSidebarCreateButtonProps): ReactElement | null {
  const { t } = useTranslations();
  const { openComposer } = useWorkspaceComposerModal();
  const { enabled: publishEnabled } = usePlanFeature("publish_enabled");

  if (!publishEnabled) return null;

  return (
    <div
      className={`shrink-0 pt-2 ${showExpandedContent ? "px-3 pb-3" : "flex justify-center px-2 pb-3"}`}
    >
      <button
        type="button"
        onClick={() => openComposer()}
        aria-label={t("shell.create")}
        className={`flex items-center rounded-lg bg-secondary text-on-secondary shadow-sm transition-opacity hover:opacity-95 ${
          showExpandedContent
            ? "w-full gap-2.5 px-3 py-2.5"
            : "h-10 w-10 shrink-0 justify-center p-0"
        }`}
      >
        <span
          className={`flex shrink-0 items-center justify-center ${
            showExpandedContent ? "h-7 w-7 rounded-full bg-white/20" : ""
          }`}
        >
          <span className="material-symbols-outlined text-[20px]">add</span>
        </span>
        {showExpandedContent ? (
          <>
            <span className="flex-1 text-left text-sm font-semibold">{t("shell.create")}</span>
            <kbd className="hidden rounded bg-white/15 px-1.5 py-0.5 text-[10px] font-medium tracking-wide sm:inline">
              {t("shell.createShortcut")}
            </kbd>
          </>
        ) : null}
      </button>
    </div>
  );
}
