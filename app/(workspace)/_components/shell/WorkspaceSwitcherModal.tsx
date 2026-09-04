"use client";

import { useRouter } from "next/navigation";
import { useEffect, type ReactElement } from "react";
import { createPortal } from "react-dom";

import { setActiveWorkspaceId } from "@/lib/auth/session";
import { useTranslations } from "@/lib/i18n/WorkspaceLocaleProvider";
import { formatWorkspaceDisplayName } from "@/lib/workspace/formatWorkspaceDisplayName";

import { useActiveWorkspaceId } from "../../_hooks/useActiveWorkspaceId";
import { useWorkspaceCreateDialogContext } from "../WorkspaceCreateDialogProvider";
import { useStoredWorkspaces } from "../../workspaces/_hooks/useStoredWorkspaces";

function workspaceInitial(name: string): string {
  const trimmed = name.trim();
  return trimmed ? trimmed.charAt(0).toUpperCase() : "?";
}

interface WorkspaceSwitcherModalProps {
  readonly open: boolean;
  readonly onClose: () => void;
}

export function WorkspaceSwitcherModal({
  open,
  onClose,
}: WorkspaceSwitcherModalProps): ReactElement | null {
  const { t } = useTranslations();
  const router = useRouter();
  const activeId = useActiveWorkspaceId();
  const { workspaces } = useStoredWorkspaces();
  const createDialog = useWorkspaceCreateDialogContext();
  const root = typeof document !== "undefined" ? document.body : null;

  const active = workspaces.find((w) => w.id === activeId) ?? workspaces[0] ?? null;

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent): void => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  if (!root) return null;

  const onSelect = (id: string): void => {
    setActiveWorkspaceId(id);
    onClose();
    router.push("/dashboard");
    router.refresh();
  };

  const onCreate = (): void => {
    createDialog.open();
    onClose();
  };

  return createPortal(
    <>
      {open ? (
        <div
        className="fixed inset-0 z-[300] flex min-h-dvh items-center justify-center bg-black/55 p-4 sm:p-5"
        role="presentation"
        onMouseDown={(e) => {
          if (e.target === e.currentTarget) onClose();
        }}
      >
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="workspace-switcher-title"
          className="relative z-[1] flex w-full max-w-md shrink-0 flex-col overflow-hidden rounded-2xl border border-outline-variant/25 bg-surface-container-highest shadow-2xl"
          onMouseDown={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between border-b border-outline-variant/20 px-5 py-4">
            <h2
              id="workspace-switcher-title"
              className="font-headline text-lg font-bold text-on-surface"
            >
              {t("shell.switchWorkspace")}
            </h2>
            <button
              type="button"
              onClick={onClose}
              className="flex h-9 w-9 items-center justify-center rounded-lg text-on-surface-variant transition-colors hover:bg-surface-container-high hover:text-on-surface"
              aria-label={t("common.close")}
            >
              <span className="material-symbols-outlined text-xl">close</span>
            </button>
          </div>

          <div className="px-5 py-3">
            <p className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">
              {t("shell.currentWorkspace")}
            </p>
            {active ? (
              <div className="mt-2 flex items-center gap-3 rounded-xl border border-primary/30 bg-primary/5 px-3 py-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-primary-container text-sm font-bold text-on-primary-container">
                  {active.image_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={active.image_url} alt="" className="h-full w-full object-cover" />
                  ) : (
                    workspaceInitial(active.name)
                  )}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-base font-semibold text-on-surface">
                    {formatWorkspaceDisplayName(active.name)}
                  </span>
                  <span className="block truncate text-xs text-on-surface-variant">
                    {t("shell.headerWorkspaceType")}
                  </span>
                </span>
                <span className="material-symbols-outlined shrink-0 text-primary">check_circle</span>
              </div>
            ) : null}
          </div>

          {workspaces.length > 1 ? (
            <div className="border-t border-outline-variant/15 px-2 py-2">
              <p className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">
                {t("shell.otherWorkspaces")}
              </p>
              <ul className="max-h-56 overflow-y-auto">
                {workspaces
                  .filter((ws) => ws.id !== active?.id)
                  .map((ws) => (
                    <li key={ws.id}>
                      <button
                        type="button"
                        onClick={() => onSelect(ws.id)}
                        className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors hover:bg-surface-container-high"
                      >
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-primary-container text-xs font-bold text-on-primary-container">
                          {ws.image_url ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={ws.image_url} alt="" className="h-full w-full object-cover" />
                          ) : (
                            workspaceInitial(ws.name)
                          )}
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-sm font-medium text-on-surface">
                            {formatWorkspaceDisplayName(ws.name)}
                          </span>
                          <span className="block truncate text-xs text-on-surface-variant">
                            {t("shell.headerWorkspaceType")}
                          </span>
                        </span>
                      </button>
                    </li>
                  ))}
              </ul>
            </div>
          ) : null}

          <div className="border-t border-outline-variant/15 p-3">
            <button
              type="button"
              onClick={onCreate}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-outline-variant/25 bg-surface-container-high px-4 py-2.5 text-sm font-semibold text-secondary transition-colors hover:bg-surface-container"
            >
              <span className="material-symbols-outlined text-lg">add</span>
              {t("shell.createWorkspace")}
            </button>
          </div>
        </div>
        </div>
      ) : null}
    </>,
    root,
  );
}
