"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, type ReactElement } from "react";

import { useTranslations } from "@/lib/i18n/WorkspaceLocaleProvider";
import { formatWorkspaceDisplayName } from "@/lib/workspace/formatWorkspaceDisplayName";

import { useActiveWorkspaceId } from "../../_hooks/useActiveWorkspaceId";
import { useStoredWorkspaces } from "../../workspaces/_hooks/useStoredWorkspaces";
import { WorkspaceSwitcherModal } from "./WorkspaceSwitcherModal";

interface WorkspaceSidebarWorkspaceBlockProps {
  readonly showExpandedContent: boolean;
}

function initialLetter(name: string): string {
  const t = name.trim();
  return t ? t.charAt(0).toUpperCase() : "?";
}

export function WorkspaceSidebarWorkspaceBlock({
  showExpandedContent,
}: WorkspaceSidebarWorkspaceBlockProps): ReactElement {
  const { t } = useTranslations();
  const pathname = usePathname();
  const activeId = useActiveWorkspaceId();
  const { workspaces } = useStoredWorkspaces();
  const [switcherOpen, setSwitcherOpen] = useState(false);
  const active = workspaces.find((w) => w.id === activeId) ?? workspaces[0] ?? null;
  const name = active?.name?.trim() || t("settings.workspace");
  const displayName = formatWorkspaceDisplayName(name);

  const links = [
    { href: "/accounts", labelKey: "shell.socialAccounts", icon: "contacts" },
    { href: "/settings/members", labelKey: "shell.teamMembers", icon: "group" },
    { href: "/settings/persona", labelKey: "shell.brandVoice", icon: "campaign" },
    { href: "/settings/ai", labelKey: "shell.aiSettings", icon: "auto_awesome" },
    { href: "/integrations", labelKey: "shell.integrations", icon: "extension" },
  ] as const;

  const settingsActive = pathname === "/settings" || pathname.startsWith("/settings/");

  return (
    <div className={`mt-4 shrink-0 ${showExpandedContent ? "" : "flex w-full flex-col items-center"}`}>
      <div>
        {showExpandedContent ? (
          <div className="mb-1 flex items-start justify-between gap-2 px-3 py-1.5">
            <div className="flex min-w-0 flex-1 items-start gap-2">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center overflow-hidden rounded-md bg-primary-container text-xs font-bold text-on-primary-container">
                {active?.image_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={active.image_url} alt="" className="h-full w-full object-cover" />
                ) : (
                  initialLetter(name)
                )}
              </span>
              <span className="min-w-0 flex-1 text-[10px] font-medium leading-tight text-on-surface">
                {displayName}
              </span>
            </div>
            <div className="flex shrink-0 items-center gap-0.5">
              <button
                type="button"
                onClick={() => setSwitcherOpen(true)}
                className="flex h-8 w-8 items-center justify-center rounded-md text-on-surface-variant transition-colors hover:bg-surface-container-high hover:text-on-surface"
                aria-label={t("shell.switchWorkspace")}
                title={t("shell.switchWorkspace")}
              >
                <span className="material-symbols-outlined text-[20px]">swap_horiz</span>
              </button>
              <Link
                href="/settings"
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-md transition-colors ${
                  settingsActive
                    ? "text-secondary"
                    : "text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface"
                }`}
                aria-label={t("nav.settings")}
                title={t("nav.settings")}
              >
                <span className="material-symbols-outlined text-[20px]">settings</span>
              </Link>
            </div>
          </div>
        ) : (
          <div className="mb-2 flex flex-col items-center gap-1">
            <button
              type="button"
              onClick={() => setSwitcherOpen(true)}
              className="flex h-10 w-10 items-center justify-center rounded-lg text-on-surface-variant hover:bg-surface-container-high"
              aria-label={t("shell.switchWorkspace")}
              title={t("shell.switchWorkspace")}
            >
              <span className="material-symbols-outlined text-xl">swap_horiz</span>
            </button>
            <Link
              href="/settings"
              className="flex h-10 w-10 items-center justify-center rounded-lg text-on-surface-variant hover:bg-surface-container-high"
              aria-label={t("nav.settings")}
            >
              <span className="material-symbols-outlined text-xl">settings</span>
            </Link>
          </div>
        )}
        <ul className={`space-y-0.5 ${showExpandedContent ? "" : "flex flex-col items-center"}`}>
          {links.map((item) => {
            const activeLink = pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  title={showExpandedContent ? undefined : t(item.labelKey)}
                  className={`text-sm transition-colors ${
                    showExpandedContent
                      ? "flex w-full items-center gap-3 rounded-lg py-2 pl-9 pr-3"
                      : "flex h-10 w-10 items-center justify-center rounded-lg p-0"
                  } ${
                    activeLink
                      ? "bg-surface-container-high font-medium text-on-surface"
                      : "text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface"
                  }`}
                >
                  <span className="material-symbols-outlined shrink-0 text-[20px]">{item.icon}</span>
                  {showExpandedContent ? (
                    <span className="truncate">{t(item.labelKey)}</span>
                  ) : null}
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
      <WorkspaceSwitcherModal open={switcherOpen} onClose={() => setSwitcherOpen(false)} />
    </div>
  );
}
