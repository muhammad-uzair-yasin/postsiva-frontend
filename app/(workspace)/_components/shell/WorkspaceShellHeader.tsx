"use client";

import type { ReactElement } from "react";
import { usePathname } from "next/navigation";

import { useTranslations } from "@/lib/i18n/WorkspaceLocaleProvider";
import { pathnameHidesWorkspaceChannelPicker } from "@/lib/workspace/headerChannelPickerPaths";

import { useWorkspaceLayout } from "../../_context/WorkspaceLayoutContext";
import { WorkspaceHeaderChannelDropdown } from "./WorkspaceHeaderChannelDropdown";

/** Mobile-only top bar (sidebar layout). Brand lives in the sidebar. */
export function WorkspaceShellHeader(): ReactElement | null {
  const { t } = useTranslations();
  const pathname = usePathname();
  const hideChannelPicker = pathnameHidesWorkspaceChannelPicker(pathname);
  const { layoutMode, setSidebarMobileOpen } = useWorkspaceLayout();
  const isSidebar = layoutMode === "sidebar";

  if (!isSidebar) {
    return null;
  }

  return (
    <header className="sticky top-0 z-50 overflow-visible border-b border-outline-variant/15 bg-surface/95 shadow-sm backdrop-blur-xl lg:hidden">
      <div className="flex h-14 items-center gap-1.5 px-2 sm:gap-3 sm:px-4">
        <button
          type="button"
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-on-surface-variant hover:bg-surface-container-high"
          aria-label={t("nav.openNavigation")}
          onClick={() => setSidebarMobileOpen(true)}
        >
          <span className="material-symbols-outlined text-2xl">menu</span>
        </button>

        <div className="flex-1" aria-hidden />
      </div>

      {!hideChannelPicker ? (
        <div className="border-t border-outline-variant/10 px-3 py-2 sm:px-4">
          <WorkspaceHeaderChannelDropdown align="left" />
        </div>
      ) : null}
    </header>
  );
}
