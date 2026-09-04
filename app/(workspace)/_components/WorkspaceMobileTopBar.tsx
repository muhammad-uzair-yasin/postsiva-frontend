"use client";

import { useTranslations } from "@/lib/i18n/WorkspaceLocaleProvider";
import { useWorkspaceLayout } from "../_context/WorkspaceLayoutContext";
import { usePlanFeature } from "@/lib/billing/BillingContext";
import { useWorkspaceComposerModal } from "./WorkspaceComposerModalProvider";

/**
 * Slim top bar shown only on mobile (< lg / 1024px).
 * Contains a hamburger button that opens the sidebar drawer and the Postsiva logo.
 * Hidden on lg+ via `lg:hidden`.
 */
export function WorkspaceMobileTopBar(): React.ReactElement {
  const { t } = useTranslations();
  const { setSidebarMobileOpen, sidebarMobileOpen } = useWorkspaceLayout();
  const { openComposer } = useWorkspaceComposerModal();
  const { enabled: publishEnabled } = usePlanFeature("publish_enabled");

  return (
    <header className="fixed left-0 right-0 top-0 z-40 flex h-14 items-center justify-between border-b border-outline-variant/15 bg-surface/95 px-4 backdrop-blur-xl lg:hidden">
      <button
        type="button"
        aria-label={t("nav.openNavigation")}
        aria-expanded={sidebarMobileOpen}
        aria-controls="workspace-sidebar"
        onClick={() => setSidebarMobileOpen(true)}
        className="flex h-10 w-10 items-center justify-center rounded-lg text-on-surface-variant transition-colors hover:bg-surface-container-high active:bg-surface-container-highest"
      >
        <span className="material-symbols-outlined text-2xl">menu</span>
      </button>

      <span className="absolute left-1/2 -translate-x-1/2 text-base font-bold text-on-surface">
        Post<span className="text-primary">siva</span>
      </span>

      {publishEnabled ? (
        <button
          type="button"
          onClick={() => openComposer()}
          aria-label={t("nav.createPost")}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-on-primary shadow-md"
        >
          <span className="material-symbols-outlined text-xl">add</span>
        </button>
      ) : (
        <div className="h-10 w-10" aria-hidden />
      )}
    </header>
  );
}
