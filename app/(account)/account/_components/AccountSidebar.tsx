"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, type ReactElement } from "react";

import { useWorkspaceAccountSettings } from "../../../(workspace)/_components/shell/WorkspaceAccountSettingsProvider";
import { useTranslations } from "@/lib/i18n/WorkspaceLocaleProvider";

import { useWorkspaceLayout } from "../../../(workspace)/_context/WorkspaceLayoutContext";
import { useAuthLogout } from "../../../(workspace)/_hooks/useAuthLogout";
import { LogoutConfirmModal } from "../../../(workspace)/_components/LogoutConfirmModal";
import { ACCOUNT_NAV_ITEMS } from "../_data/accountNav";
import type { WorkspaceAccountSettingsHref } from "../../../(workspace)/_components/shell/WorkspaceAccountSettingsModal";

/** Dashboard-style left sidebar for the account/workspaces area (no channel selector). */
export function AccountSidebar(): ReactElement {
  const { t } = useTranslations();
  const {
    sidebarCollapsed,
    setSidebarCollapsed,
    sidebarHovered,
    setSidebarHovered,
    sidebarMobileOpen,
    setSidebarMobileOpen,
  } = useWorkspaceLayout();
  const pathname = usePathname();
  const { openAccountSettings } = useWorkspaceAccountSettings();
  const { modalOpen, busy, apiError, openLogoutModal, closeLogoutModal, confirmLogout } =
    useAuthLogout();

  const showExpandedContent = !sidebarCollapsed || sidebarHovered;

  useEffect(() => {
    setSidebarMobileOpen(false);
  }, [pathname, setSidebarMobileOpen]);

  useEffect(() => {
    if (!sidebarMobileOpen) return;
    const onKey = (e: KeyboardEvent): void => {
      if (e.key === "Escape") setSidebarMobileOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [sidebarMobileOpen, setSidebarMobileOpen]);

  return (
    <>
      {sidebarMobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-[2px] lg:hidden"
          aria-hidden="true"
          onClick={() => setSidebarMobileOpen(false)}
        />
      )}

      <aside
        id="account-sidebar"
        aria-label={t("nav.mainAria")}
        onMouseEnter={() => setSidebarHovered(true)}
        onMouseLeave={() => setSidebarHovered(false)}
        className={[
          "fixed left-0 top-0 z-50 flex h-screen flex-col border-r border-outline-variant/15 bg-surface will-change-[width,transform,box-shadow]",
          "transition-[width,transform,box-shadow] duration-300 ease-in-out",
          showExpandedContent ? "w-64" : "w-20",
          sidebarMobileOpen ? "translate-x-0" : "-translate-x-full",
          "lg:translate-x-0",
        ].join(" ")}
      >
        {/* Header */}
        <div className="flex h-16 shrink-0 items-center justify-between border-b border-outline-variant/15 px-4">
          <span
            className={`overflow-hidden text-lg font-bold text-on-surface transition-all duration-300 ease-in-out ${
              showExpandedContent ? "max-w-[10rem] opacity-100" : "max-w-0 opacity-0"
            }`}
          >
            Postsiva
          </span>
          <button
            type="button"
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="hidden rounded-lg p-2 text-on-surface-variant hover:bg-surface-container-high lg:flex"
            aria-label={sidebarCollapsed ? t("nav.expandSidebar") : t("nav.collapseSidebar")}
          >
            <span className="material-symbols-outlined text-xl">
              {sidebarCollapsed ? "menu" : "menu_open"}
            </span>
          </button>
          <button
            type="button"
            onClick={() => setSidebarMobileOpen(false)}
            className="flex rounded-lg p-2 text-on-surface-variant hover:bg-surface-container-high lg:hidden"
            aria-label={t("nav.closeNavigation")}
          >
            <span className="material-symbols-outlined text-xl">close</span>
          </button>
        </div>

        {/* Section label */}
        <div className="shrink-0 px-4 pb-1 pt-4">
          <span
            className={`text-[11px] font-bold uppercase tracking-wide text-on-surface-variant transition-opacity duration-300 ${
              showExpandedContent ? "opacity-100" : "opacity-0"
            }`}
          >
            {t("settings.account")}
          </span>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 pb-3">
          <ul className="space-y-1">
            {ACCOUNT_NAV_ITEMS.map((item) => {
              const isActive = pathname === item.href;
              const label = t(item.labelKey) || item.fallback;
              const rowClass = `flex w-full items-center gap-3 rounded-lg px-3 py-2.5 transition-colors ${
                isActive
                  ? "bg-primary text-on-primary"
                  : "text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface"
              } ${showExpandedContent ? "" : "justify-center"}`;

              if (item.href === "/account/billing") {
                return (
                  <li key={item.href}>
                    <button
                      type="button"
                      onClick={() =>
                        openAccountSettings(
                          item.href as WorkspaceAccountSettingsHref,
                          item.labelKey,
                        )
                      }
                      title={showExpandedContent ? undefined : label}
                      className={rowClass}
                    >
                      <span className="material-symbols-outlined shrink-0 text-xl">{item.icon}</span>
                      <span
                        className={`overflow-hidden whitespace-nowrap text-sm font-medium transition-all duration-300 ease-in-out ${
                          showExpandedContent ? "max-w-[12rem] opacity-100" : "max-w-0 opacity-0"
                        }`}
                      >
                        {label}
                      </span>
                    </button>
                  </li>
                );
              }

              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    title={showExpandedContent ? undefined : label}
                    aria-current={isActive ? "page" : undefined}
                    className={rowClass}
                  >
                    <span className="material-symbols-outlined shrink-0 text-xl">{item.icon}</span>
                    <span
                      className={`overflow-hidden whitespace-nowrap text-sm font-medium transition-all duration-300 ease-in-out ${
                        showExpandedContent ? "max-w-[12rem] opacity-100" : "max-w-0 opacity-0"
                      }`}
                    >
                      {label}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Logout */}
        <div className="shrink-0 border-t border-outline-variant/15 p-3">
          <button
            type="button"
            onClick={openLogoutModal}
            className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-on-surface-variant transition-colors hover:bg-surface-container-high hover:text-on-surface ${
              showExpandedContent ? "" : "justify-center"
            }`}
            title={showExpandedContent ? undefined : t("nav.logout")}
          >
            <span className="material-symbols-outlined shrink-0 text-xl">logout</span>
            <span
              className={`overflow-hidden whitespace-nowrap text-sm font-medium transition-all duration-300 ease-in-out ${
                showExpandedContent ? "max-w-[12rem] opacity-100" : "max-w-0 opacity-0"
              }`}
            >
              {t("nav.logout")}
            </span>
          </button>
          <LogoutConfirmModal
            open={modalOpen}
            busy={busy}
            apiError={apiError}
            onCancel={closeLogoutModal}
            onConfirm={confirmLogout}
          />
        </div>
      </aside>
    </>
  );
}
