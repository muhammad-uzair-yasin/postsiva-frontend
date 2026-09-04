"use client";

import { useEffect, useId, useRef } from "react";
import { createPortal } from "react-dom";

import { useTranslations } from "@/lib/i18n/WorkspaceLocaleProvider";
import {
  WORKSPACE_ROLE_EDITOR,
  WORKSPACE_ROLE_PUBLISHER,
} from "@/lib/workspaces/workspaceMembersApi";

interface InviteMemberModalProps {
  open: boolean;
  busy: boolean;
  error: string | null;
  onClose: () => void;
  onSubmit: (email: string, roleId: number) => void | Promise<void>;
}

export function InviteMemberModal({
  open,
  busy,
  error,
  onClose,
  onSubmit,
}: InviteMemberModalProps): React.ReactElement | null {
  const { t } = useTranslations();
  const titleId = useId();
  const descId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const root = typeof document !== "undefined" ? document.body : null;

  useEffect(() => {
    if (!open) {
      return;
    }
    inputRef.current?.focus();
    const onKey = (e: KeyboardEvent): void => {
      if (e.key === "Escape" && !busy) {
        onClose();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
    };
  }, [open, busy, onClose]);

  useEffect(() => {
    if (!open) {
      return;
    }
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  if (!open || !root) {
    return null;
  }

  return createPortal(
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center bg-black/55 p-4 backdrop-blur-sm"
      role="presentation"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget && !busy) {
          onClose();
        }
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descId}
        className="glass-panel w-full max-w-md rounded-2xl border border-outline-variant/15 p-6 shadow-[0_24px_48px_rgba(0,0,0,0.35)]"
        onMouseDown={(e) => {
          e.stopPropagation();
        }}
      >
        <h2
          id={titleId}
          className="text-lg font-bold tracking-tight text-on-surface"
        >
          {t("workspaces.inviteTitle")}
        </h2>
        <p
          id={descId}
          className="mt-2 text-sm leading-relaxed text-on-surface-variant"
        >
          {t("workspaces.inviteBody")}
        </p>
        <form
          className="mt-5 space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            const email = inputRef.current?.value?.trim() ?? "";
            const form = e.currentTarget;
            const roleRaw = form.elements.namedItem("inviteRole");
            const roleValue =
              roleRaw instanceof HTMLSelectElement
                ? Number.parseInt(roleRaw.value, 10)
                : Number.NaN;
            const roleId =
              roleValue === WORKSPACE_ROLE_PUBLISHER
                ? WORKSPACE_ROLE_PUBLISHER
                : WORKSPACE_ROLE_EDITOR;
            void onSubmit(email, roleId);
          }}
        >
          <div className="space-y-1.5">
            <label
              htmlFor="invite-member-email"
              className="text-xs font-bold uppercase tracking-widest text-on-surface-variant/80"
            >
              {t("workspaces.inviteEmailLabel")}
            </label>
            <input
              ref={inputRef}
              id="invite-member-email"
              name="inviteEmail"
              type="email"
              autoComplete="email"
              required
              disabled={busy}
              placeholder={t("workspaces.inviteEmailPlaceholder")}
              className="w-full rounded-xl border border-outline-variant/15 bg-surface-container-lowest px-4 py-3 text-on-surface outline-none transition-colors focus:border-secondary focus:ring-2 focus:ring-secondary/25 disabled:opacity-50"
            />
          </div>
          <div className="space-y-1.5">
            <label
              htmlFor="invite-member-role"
              className="text-xs font-bold uppercase tracking-widest text-on-surface-variant/80"
            >
              {t("workspaces.inviteRoleLabel")}
            </label>
            <select
              id="invite-member-role"
              name="inviteRole"
              disabled={busy}
              defaultValue={String(WORKSPACE_ROLE_EDITOR)}
              className="w-full rounded-xl border border-outline-variant/15 bg-surface-container-lowest px-4 py-3 text-on-surface outline-none transition-colors focus:border-secondary focus:ring-2 focus:ring-secondary/25 disabled:opacity-50"
            >
              <option value={String(WORKSPACE_ROLE_EDITOR)}>
                {t("workspaces.inviteRoleEditor")}
              </option>
              <option value={String(WORKSPACE_ROLE_PUBLISHER)}>
                {t("workspaces.inviteRolePublisher")}
              </option>
            </select>
          </div>
          {error ? (
            <div
              className="rounded-lg border border-error/30 bg-error/10 px-3 py-2 text-sm text-error"
              role="alert"
            >
              {error}
            </div>
          ) : null}
          <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
            <button
              type="button"
              disabled={busy}
              onClick={() => {
                onClose();
              }}
              className="rounded-xl px-5 py-2.5 text-sm font-bold text-on-surface-variant transition-colors hover:bg-surface-container-high hover:text-on-surface disabled:opacity-50"
            >
              {t("workspaces.createCancel")}
            </button>
            <button
              type="submit"
              disabled={busy}
              className="rounded-xl bg-primary-container px-5 py-2.5 text-sm font-bold text-on-primary-container shadow-lg shadow-primary-container/20 transition-opacity hover:opacity-90 disabled:opacity-50"
            >
              {busy ? t("workspaces.inviteSubmitting") : t("workspaces.inviteSubmit")}
            </button>
          </div>
        </form>
      </div>
    </div>,
    root,
  );
}
