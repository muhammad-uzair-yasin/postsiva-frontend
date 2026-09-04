"use client";

import { useEffect, useId, useRef } from "react";
import { createPortal } from "react-dom";

import { useTranslations } from "@/lib/i18n/WorkspaceLocaleProvider";

import { ChannelDisconnectDataWarning } from "../../_components/ChannelDisconnectDataWarning";

interface AdPlatformDisconnectConfirmModalProps {
  open: boolean;
  platformName: string;
  busy: boolean;
  error: string | null;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
}

/**
 * Confirmation layer above Connect your world. Uses z-[200] and capture-phase
 * Escape so the parent ad-platform dialog does not close first.
 */
export function AdPlatformDisconnectConfirmModal({
  open,
  platformName,
  busy,
  error,
  onClose,
  onConfirm,
}: AdPlatformDisconnectConfirmModalProps): React.ReactElement | null {
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
        e.preventDefault();
        e.stopPropagation();
        onClose();
      }
    };
    document.addEventListener("keydown", onKey, true);
    return () => {
      document.removeEventListener("keydown", onKey, true);
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
      className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 p-4 backdrop-blur-[2px]"
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
        aria-busy={busy}
        className="glass-panel w-full max-w-md rounded-2xl border border-outline-variant/15 p-6 shadow-[0_24px_48px_rgba(0,0,0,0.4)]"
        onMouseDown={(e) => {
          e.stopPropagation();
        }}
      >
        <h2
          id={titleId}
          className="text-lg font-bold tracking-tight text-on-surface"
        >
          {t("adPlatform.disconnectTitle", { platform: platformName })}
        </h2>
        <div id={descId} className="mt-3">
          <ChannelDisconnectDataWarning
            introKey="adPlatform.disconnectBodyIntro"
            introVars={{ platform: platformName }}
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
            {t("common.cancel")}
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={() => {
              void onConfirm();
            }}
            className="rounded-xl bg-error/90 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-error/20 transition-opacity hover:bg-error disabled:opacity-50"
          >
            {busy ? t("adPlatform.cardDisconnecting") : t("adPlatform.cardDisconnect")}
          </button>
        </div>
      </div>
    </div>,
    root,
  );
}
