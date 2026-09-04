"use client";

import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import type { ReactElement } from "react";

import { useTranslations } from "@/lib/i18n/WorkspaceLocaleProvider";

import { useWorkspaceCreateDialog } from "../_hooks/useWorkspaceCreateDialog";

interface WorkspaceCreateDialogProps {
  readonly dialog: ReturnType<typeof useWorkspaceCreateDialog>;
}

export function WorkspaceCreateDialog({
  dialog,
}: WorkspaceCreateDialogProps): ReactElement | null {
  const { t } = useTranslations();
  const { isOpen, isSubmitting, close, onSubmit, name, setName, error } = dialog;
  const nameInputRef = useRef<HTMLInputElement>(null);
  const root = typeof document !== "undefined" ? document.body : null;

  useEffect(() => {
    if (!isOpen) return;
    nameInputRef.current?.focus();
    const onKey = (e: KeyboardEvent): void => {
      if (e.key === "Escape" && !isSubmitting) {
        close();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [isOpen, isSubmitting, close]);

  useEffect(() => {
    if (!isOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [isOpen]);

  if (!isOpen || !root) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[350] flex items-center justify-center overflow-y-auto bg-black/55 p-4 backdrop-blur-sm"
      role="presentation"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget && !isSubmitting) {
          close();
        }
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="workspace-create-title"
        className="my-auto w-full max-w-md rounded-2xl border border-outline-variant/15 bg-surface-container-low p-6 shadow-[0_24px_48px_rgba(0,0,0,0.35)]"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <h2 id="workspace-create-title" className="mb-1 text-lg font-bold text-on-surface">
          {t("workspaces.createModalTitle")}
        </h2>
        <p className="mb-4 text-sm text-on-surface-variant">{t("workspaces.createModalBody")}</p>
        <form onSubmit={onSubmit} className="space-y-4">
          {error ? (
            <p
              className="rounded-xl border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-200"
              role="alert"
            >
              {error}
            </p>
          ) : null}
          <div>
            <label
              htmlFor="workspace-create-name"
              className="mb-1 block text-xs font-semibold text-on-surface-variant"
            >
              {t("workspaces.createNameLabel")}
            </label>
            <input
              ref={nameInputRef}
              id="workspace-create-name"
              type="text"
              autoComplete="organization"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-xl border-0 bg-surface-container-high px-4 py-3 text-on-surface placeholder:text-outline focus:ring-2 focus:ring-secondary/50"
              placeholder={t("workspaces.createNamePlaceholder")}
              disabled={isSubmitting}
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={close}
              className="rounded-xl px-4 py-2 text-sm font-semibold text-on-surface-variant hover:bg-surface-container-high"
              disabled={isSubmitting}
            >
              {t("workspaces.createCancel")}
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !name.trim()}
              className="rounded-xl bg-primary px-4 py-2 text-sm font-bold text-on-primary disabled:opacity-50"
            >
              {isSubmitting ? t("workspaces.createSubmitting") : t("workspaces.createSubmit")}
            </button>
          </div>
        </form>
      </div>
    </div>,
    root,
  );
}
