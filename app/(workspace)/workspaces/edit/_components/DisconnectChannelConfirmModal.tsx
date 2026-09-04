"use client";

import { useEffect, useId, useRef } from "react";
import { createPortal } from "react-dom";

import { useTranslations } from "@/lib/i18n/WorkspaceLocaleProvider";

import { ChannelDisconnectDataWarning } from "../../../_components/ChannelDisconnectDataWarning";

interface DisconnectChannelConfirmModalProps {
  open: boolean;
  platformDisplay: string;
  channelLabel: string;
  busy: boolean;
  error: string | null;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
}

export function DisconnectChannelConfirmModal({
  open,
  platformDisplay,
  channelLabel,
  busy,
  error,
  onClose,
  onConfirm,
}: DisconnectChannelConfirmModalProps): React.ReactElement | null {
  const { t } = useTranslations();
  const titleId = useId();
  const descId = useId();
  const cancelRef = useRef<HTMLButtonElement>(null);
  const root = typeof document !== "undefined" ? document.body : null;

  useEffect(() => {
    if (!open) {
      return;
    }
    cancelRef.current?.focus();
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
          {t("workspaces.disconnectTitle")}
        </h2>
        <div id={descId} className="mt-3">
          <ChannelDisconnectDataWarning
            introKey="workspaces.disconnectBodyIntro"
            introVars={{ platform: platformDisplay, label: channelLabel }}
          />
        </div>
        {error ? (
          <div
            className="mt-4 rounded-lg border border-error/30 bg-error/10 px-3 py-2 text-sm text-error"
            role="alert"
          >
            {error}
          </div>
        ) : null}
        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button
            ref={cancelRef}
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
            type="button"
            disabled={busy}
            onClick={() => {
              void onConfirm();
            }}
            className="rounded-xl bg-error/90 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-error/20 transition-opacity hover:bg-error disabled:opacity-50"
          >
            {busy ? t("workspaces.disconnectSubmitting") : t("workspaces.disconnectConfirm")}
          </button>
        </div>
      </div>
    </div>,
    root,
  );
}
