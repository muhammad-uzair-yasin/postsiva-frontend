"use client";

import Link from "next/link";
import type { ReactElement } from "react";

import { useTranslations } from "@/lib/i18n/WorkspaceLocaleProvider";

import { useActiveWorkspaceId } from "../../_hooks/useActiveWorkspaceId";
import { useStoredWorkspaces } from "../../workspaces/_hooks/useStoredWorkspaces";
import { WORKSPACE_SETTINGS_HUB_ROWS } from "../_data/workspaceSettingsHub";

export function WorkspaceSettingsHubClient(): ReactElement {
  const { t } = useTranslations();
  const activeId = useActiveWorkspaceId();
  const { workspaces } = useStoredWorkspaces();
  const active = workspaces.find((w) => w.id === activeId) ?? null;
  const name = active?.name?.trim() || t("settings.workspace");

  return (
    <div className="w-full">
      <header className="mb-8">
        <h1 className="text-2xl font-bold text-on-surface">{name}</h1>
        <p className="mt-1 text-sm text-on-surface-variant">{t("shell.settingsOwnerHint")}</p>
      </header>

      <ul className="divide-y divide-outline-variant/15 rounded-2xl border border-outline-variant/15 bg-surface-container-low/40">
        {WORKSPACE_SETTINGS_HUB_ROWS.map((row) => (
          <li key={row.href}>
            <Link
              href={row.href}
              className="flex items-start gap-4 px-4 py-4 transition-colors hover:bg-surface-container-high/60 sm:px-5"
            >
              <span className="material-symbols-outlined mt-0.5 shrink-0 text-xl text-on-surface-variant">
                {row.icon}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-bold text-on-surface">{t(row.labelKey)}</span>
                <span className="mt-0.5 block text-xs leading-relaxed text-on-surface-variant">
                  {t(row.descriptionKey)}
                </span>
              </span>
              <span className="material-symbols-outlined shrink-0 text-on-surface-variant">chevron_right</span>
            </Link>
          </li>
        ))}
      </ul>

      <div className="mt-8 border-t border-outline-variant/15 pt-6">
        <Link
          href={`/workspaces/delete?id=${encodeURIComponent(activeId ?? "")}`}
          className="text-sm font-semibold text-error hover:underline"
        >
          {t("shell.deleteWorkspace")}
        </Link>
        <p className="mt-1 text-xs text-on-surface-variant">{t("shell.deleteWorkspaceHint")}</p>
      </div>
    </div>
  );
}
