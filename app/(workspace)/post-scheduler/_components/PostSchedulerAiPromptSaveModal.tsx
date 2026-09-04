"use client";

import { useEffect, useRef, useState, type ReactElement } from "react";
import { createPortal } from "react-dom";

import { useTranslations } from "@/lib/i18n/WorkspaceLocaleProvider";

import {
  bindComposerEscapeOverlay,
  COMPOSER_ESCAPE_OVERLAY_ATTR,
} from "./postSchedulerComposerEscapeOverlay";

interface PostSchedulerAiPromptSaveModalProps {
  readonly open: boolean;
  readonly initialTitle?: string;
  readonly saving: boolean;
  readonly error: string | null;
  readonly onClose: () => void;
  readonly onSave: (title: string) => void | Promise<void>;
}

export function PostSchedulerAiPromptSaveModal({
  open,
  initialTitle = "",
  saving,
  error,
  onClose,
  onSave,
}: PostSchedulerAiPromptSaveModalProps): ReactElement | null {
  const { t } = useTranslations();
  const [title, setTitle] = useState(initialTitle);
  const inputRef = useRef<HTMLInputElement>(null);
  const root = typeof document !== "undefined" ? document.body : null;

  useEffect(() => {
    if (open) setTitle(initialTitle);
  }, [open, initialTitle]);

  useEffect(() => {
    if (!open || saving) {
      return () => {};
    }
    return bindComposerEscapeOverlay(true, onClose);
  }, [open, saving, onClose]);

  useEffect(() => {
    if (!open) return;
    inputRef.current?.focus();
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  if (!open || !root) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[250] flex items-center justify-center bg-black/55 p-4 backdrop-blur-sm"
      role="presentation"
      {...{ [COMPOSER_ESCAPE_OVERLAY_ATTR]: true }}
      onMouseDown={(e) => {
        if (e.target === e.currentTarget && !saving) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="ai-prompt-save-title"
        className="w-full max-w-md rounded-2xl border border-outline-variant/15 bg-surface-container-low p-5 shadow-xl"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <h2 id="ai-prompt-save-title" className="text-sm font-bold text-on-surface">
          {t("postScheduler.aiToolkit.savePromptModalTitle")}
        </h2>
        <p className="mt-1 text-xs text-on-surface-variant">
          {t("postScheduler.aiToolkit.savePromptModalHint")}
        </p>
        {error ? (
          <p className="mt-3 text-xs text-error" role="alert">
            {error}
          </p>
        ) : null}
        <label className="mt-4 block">
          <span className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-neutral-400">
            {t("postScheduler.aiToolkit.savePromptTitleLabel")}
          </span>
          <input
            ref={inputRef}
            type="text"
            maxLength={200}
            value={title}
            disabled={saving}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full rounded-lg border border-outline-variant/30 bg-surface-container px-3 py-2 font-body text-xs text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/40"
            placeholder={t("postScheduler.aiToolkit.savePromptTitlePlaceholder")}
          />
        </label>
        <div className="mt-4 flex justify-end gap-2">
          <button
            type="button"
            disabled={saving}
            onClick={onClose}
            className="rounded-lg px-3 py-2 text-xs font-bold text-on-surface-variant hover:bg-surface-container-high disabled:opacity-50"
          >
            {t("common.cancel")}
          </button>
          <button
            type="button"
            disabled={saving || !title.trim()}
            onClick={() => {
              void onSave(title.trim());
            }}
            className="rounded-lg bg-[#6B49D8] px-3 py-2 text-xs font-bold text-on-primary disabled:cursor-not-allowed disabled:opacity-50"
          >
            {saving ? t("common.saving") : t("common.save")}
          </button>
        </div>
      </div>
    </div>,
    root,
  );
}
