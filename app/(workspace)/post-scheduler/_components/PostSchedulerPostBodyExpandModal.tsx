"use client";

import { useEffect, useRef, type ReactElement } from "react";
import { createPortal } from "react-dom";

import { useTranslations } from "@/lib/i18n/WorkspaceLocaleProvider";

import { ComposerBodyFormattedText } from "./ComposerBodyFormattedText";
import {
  bindComposerEscapeOverlay,
  COMPOSER_ESCAPE_OVERLAY_ATTR,
} from "./postSchedulerComposerEscapeOverlay";

interface PostSchedulerPostBodyExpandModalProps {
  readonly open: boolean;
  readonly value: string;
  readonly placeholder: string;
  readonly maxLength?: number;
  readonly disabled?: boolean;
  readonly onChange: (value: string) => void;
  readonly onClose: () => void;
}

export function PostSchedulerPostBodyExpandModal({
  open,
  value,
  placeholder,
  maxLength,
  disabled = false,
  onChange,
  onClose,
}: PostSchedulerPostBodyExpandModalProps): ReactElement | null {
  const { t } = useTranslations();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const root = typeof document !== "undefined" ? document.body : null;

  const syncOverlayScroll = (): void => {
    const textarea = textareaRef.current;
    const overlay = overlayRef.current;
    if (!textarea || !overlay) {
      return;
    }
    overlay.scrollTop = textarea.scrollTop;
    overlay.scrollLeft = textarea.scrollLeft;
  };

  const count =
    maxLength === undefined ? value.length : Math.min(value.length, maxLength);

  useEffect(() => bindComposerEscapeOverlay(open, onClose), [open, onClose]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const id = window.setTimeout(() => {
      textareaRef.current?.focus();
    }, 50);
    return () => {
      document.body.style.overflow = prev;
      window.clearTimeout(id);
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    syncOverlayScroll();
  }, [open, value]);

  if (!open || !root) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[260] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
      role="presentation"
      {...{ [COMPOSER_ESCAPE_OVERLAY_ATTR]: true }}
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="composer-post-body-expand-title"
        className="flex h-[70vh] w-[70vw] max-w-[70vw] flex-col rounded-2xl border border-outline-variant/15 bg-surface-container-low shadow-2xl"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="flex shrink-0 items-center justify-between border-b border-outline-variant/10 px-5 py-4">
          <h2
            id="composer-post-body-expand-title"
            className="text-sm font-semibold text-on-surface"
          >
            {t("postScheduler.composer.postBody")}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-on-surface-variant transition hover:bg-surface-container-high hover:text-on-surface"
            aria-label={t("postScheduler.composer.expandBodyCloseAria")}
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        <div className="relative flex min-h-0 flex-1 flex-col overflow-hidden p-4">
          <textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onScroll={syncOverlayScroll}
            disabled={disabled}
            placeholder={placeholder}
            {...(maxLength !== undefined ? { maxLength } : {})}
            className={`min-h-0 w-full flex-1 resize-none rounded-xl border border-outline-variant/15 bg-surface-container-lowest px-4 py-3 text-sm outline-none ring-primary/30 transition-shadow focus:ring-2 disabled:cursor-not-allowed disabled:opacity-60 ${
              value.length > 0
                ? "text-transparent caret-on-surface selection:bg-primary/20 selection:text-transparent placeholder:text-transparent"
                : "text-on-surface"
            }`}
          />
          {value.length > 0 ? (
            <div
              ref={overlayRef}
              aria-hidden
              className="pointer-events-none absolute inset-4 overflow-auto whitespace-pre-wrap break-words px-4 py-3 text-sm text-on-surface [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
            >
              <ComposerBodyFormattedText
                text={value}
                boldClassName="font-bold text-on-surface"
                highlightClassName="font-medium text-secondary"
              />
            </div>
          ) : null}
        </div>

        <div className="flex shrink-0 items-center justify-between border-t border-outline-variant/10 px-5 py-3">
          <span className="text-xs text-on-surface-variant">
            {maxLength === undefined ? count : `${count} / ${maxLength}`}
          </span>
          <button
            type="button"
            onClick={onClose}
            className="h-9 rounded-xl bg-primary px-5 text-sm font-semibold text-on-primary transition hover:bg-primary/90"
          >
            {t("postScheduler.composer.expandBodyDone")}
          </button>
        </div>
      </div>
    </div>,
    root,
  );
}
