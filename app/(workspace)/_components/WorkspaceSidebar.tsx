"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, type ReactElement } from "react";

import { useWorkspaceLayout } from "../_context/WorkspaceLayoutContext";
import { useTranslations } from "@/lib/i18n/WorkspaceLocaleProvider";
import { WorkspaceSidebarCreateButton } from "./shell/WorkspaceSidebarCreateButton";
import { WorkspaceSidebarFooter } from "./shell/WorkspaceSidebarFooter";
import { WorkspaceSidebarWorkspaceBlock } from "./shell/WorkspaceSidebarWorkspaceBlock";
import { WorkspaceShellBrand } from "./shell/WorkspaceShellBrand";

const NAV_ICON_KEYS = [
  { href: "/dashboard", icon: "dashboard", labelKey: "nav.dashboard" },
  { href: "/post-scheduler/calendar", icon: "calendar_month", labelKey: "nav.calendar" },
  { href: "/content-manager", icon: "folder", labelKey: "nav.content" },
  { href: "/inbox", icon: "inbox", labelKey: "nav.inbox" },
  { href: "/news", icon: "newspaper", labelKey: "nav.news", newBadge: true },
  { href: "/ai-watcher", icon: "visibility", labelKey: "nav.aiWatcher" },
] as const;

const COLLAPSED_ICON_CLASS =
  "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg p-0";

type NavLayout = "desktop-expanded" | "desktop-collapsed";

type NavLinkProps = {
  readonly item: (typeof NAV_ICON_KEYS)[number];
  readonly isActive: boolean;
  readonly label: string;
  readonly layout: NavLayout;
  readonly newBadgeLabel: string;
  readonly betaBadgeLabel: string;
};

function SidebarNavLink({
  item,
  isActive,
  label,
  layout,
  newBadgeLabel,
  betaBadgeLabel,
}: NavLinkProps): ReactElement {
  const showLabel = layout !== "desktop-collapsed";

  return (
    <Link
      href={item.href}
      title={showLabel ? undefined : label}
      className={[
        "transition-colors",
        layout === "desktop-expanded"
          ? "flex w-full items-center gap-3 rounded-lg px-3 py-2.5"
          : COLLAPSED_ICON_CLASS,
        isActive
          ? "bg-primary text-on-primary"
          : "text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface",
      ].join(" ")}
    >
      <span className="material-symbols-outlined shrink-0 text-xl">{item.icon}</span>
      {showLabel ? (
        <span className="min-w-0 flex-1 truncate text-sm font-medium">
          {label}
          {"newBadge" in item && item.newBadge ? (
            <span
              className={[
                "ml-1.5 rounded border px-1 py-px text-[9px] font-bold uppercase tracking-wide",
                isActive
                  ? "border-on-primary/35 bg-on-primary/20 text-on-primary"
                  : "border-primary/25 bg-primary/10 text-primary",
              ].join(" ")}
            >
              {newBadgeLabel}
            </span>
          ) : null}
          {"beta" in item && item.beta ? (
            <span className="ml-1.5 rounded border border-primary/25 bg-primary/10 px-1 py-px text-[9px] font-bold uppercase tracking-wide text-primary">
              {betaBadgeLabel}
            </span>
          ) : null}
        </span>
      ) : null}
    </Link>
  );
}

function MobileDrawerContent({
  navLinks,
  onClose,
}: {
  readonly navLinks: ReactElement[];
  readonly onClose: () => void;
}): ReactElement {
  const { t } = useTranslations();

  return (
    <>
      <div className="flex h-14 shrink-0 items-center justify-between border-b border-outline-variant/15 px-4">
        <WorkspaceShellBrand showWordmark />
        <button
          type="button"
          onClick={onClose}
          className="flex h-10 w-10 items-center justify-center rounded-lg text-on-surface-variant hover:bg-surface-container-high"
          aria-label={t("nav.closeNavigation")}
        >
          <span className="material-symbols-outlined text-[22px]">close</span>
        </button>
      </div>

      <WorkspaceSidebarCreateButton showExpandedContent />

      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
        <nav className="flex min-h-0 flex-1 flex-col overflow-hidden">
          <div className="min-h-0 flex-1 overflow-y-auto p-3">
            <ul className="space-y-1">{navLinks}</ul>
            <WorkspaceSidebarWorkspaceBlock showExpandedContent />
          </div>
        </nav>
        <WorkspaceSidebarFooter showExpandedContent />
      </div>
    </>
  );
}

export function WorkspaceSidebar(): ReactElement {
  const { t } = useTranslations();
  const {
    sidebarCollapsed,
    sidebarHovered,
    setSidebarHovered,
    sidebarMobileOpen,
    setSidebarMobileOpen,
  } = useWorkspaceLayout();
  const pathname = usePathname();
  const activeNavHref = NAV_ICON_KEYS.filter(
    (item) => pathname === item.href || pathname.startsWith(`${item.href}/`),
  )
    .sort((a, b) => b.href.length - a.href.length)[0]?.href;
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

  useEffect(() => {
    if (!sidebarMobileOpen) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [sidebarMobileOpen]);

  const expandedNavLinks = NAV_ICON_KEYS.map((item) => (
    <li key={item.href}>
      <SidebarNavLink
        item={item}
        isActive={item.href === activeNavHref}
        label={t(item.labelKey)}
        layout="desktop-expanded"
        newBadgeLabel={t("nav.newBadge")}
        betaBadgeLabel={t("settings.betaBadge")}
      />
    </li>
  ));

  const collapsedNavLinks = NAV_ICON_KEYS.map((item) => (
    <li key={item.href}>
      <SidebarNavLink
        item={item}
        isActive={item.href === activeNavHref}
        label={t(item.labelKey)}
        layout="desktop-collapsed"
        newBadgeLabel={t("nav.newBadge")}
        betaBadgeLabel={t("settings.betaBadge")}
      />
    </li>
  ));

  return (
    <>
      {/* Mobile: full-height left drawer */}
      <div
        className={[
          "fixed inset-0 z-[60] lg:hidden",
          sidebarMobileOpen ? "pointer-events-auto" : "pointer-events-none",
        ].join(" ")}
        aria-hidden={!sidebarMobileOpen}
      >
        <button
          type="button"
          aria-label={t("nav.closeNavigation")}
          className={[
            "absolute inset-0 bg-black/55 backdrop-blur-[1px] transition-opacity duration-300",
            sidebarMobileOpen ? "opacity-100" : "opacity-0",
          ].join(" ")}
          onClick={() => setSidebarMobileOpen(false)}
        />
        <aside
          id="workspace-sidebar"
          aria-label={t("nav.mainAria")}
          aria-hidden={!sidebarMobileOpen}
          className={[
            "absolute left-0 top-0 flex h-dvh w-[min(88vw,19.5rem)] flex-col border-r border-outline-variant/15 bg-surface shadow-2xl transition-transform duration-300 ease-out",
            sidebarMobileOpen ? "translate-x-0" : "-translate-x-full",
          ].join(" ")}
        >
          <MobileDrawerContent
            navLinks={expandedNavLinks}
            onClose={() => setSidebarMobileOpen(false)}
          />
        </aside>
      </div>

      {/* Desktop: persistent left sidebar */}
      <aside
        aria-label={t("nav.mainAria")}
        onMouseEnter={() => setSidebarHovered(true)}
        onMouseLeave={() => setSidebarHovered(false)}
        className={[
          "fixed left-0 top-0 z-50 hidden h-dvh flex-col border-r border-outline-variant/15 bg-surface will-change-[width,box-shadow] lg:flex",
          "transition-[width,box-shadow] duration-300 ease-in-out",
          showExpandedContent ? "w-64" : "w-20",
        ].join(" ")}
      >
        <div
          className={[
            "shrink-0 border-b border-outline-variant/15",
            showExpandedContent ? "px-3 py-3" : "flex justify-center px-2 py-3",
          ].join(" ")}
        >
          <WorkspaceShellBrand showWordmark={showExpandedContent} />
        </div>

        <WorkspaceSidebarCreateButton showExpandedContent={showExpandedContent} />

        <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
          <nav
            className={`flex min-h-0 flex-1 flex-col overflow-hidden ${showExpandedContent ? "" : "items-center"}`}
          >
            <div
              className={`min-h-0 flex-1 overflow-y-auto ${showExpandedContent ? "p-3" : "flex flex-col items-center px-2 py-3"}`}
            >
              <ul
                className={`space-y-1 ${showExpandedContent ? "w-full" : "flex w-full flex-col items-center"}`}
              >
                {showExpandedContent ? expandedNavLinks : collapsedNavLinks}
              </ul>

              <WorkspaceSidebarWorkspaceBlock showExpandedContent={showExpandedContent} />
            </div>

            <WorkspaceSidebarFooter showExpandedContent={showExpandedContent} />
          </nav>
        </div>
      </aside>
    </>
  );
}
