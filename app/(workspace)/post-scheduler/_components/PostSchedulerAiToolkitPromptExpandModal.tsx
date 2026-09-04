"use client";

import { useEffect, type ReactElement } from "react";
import { createPortal } from "react-dom";

import { useTranslations } from "@/lib/i18n/WorkspaceLocaleProvider";

import { PostSchedulerAiToolkitQuickPromptsTrigger } from "./PostSchedulerAiToolkitQuickPromptsTrigger";
import { AI_TOOLKIT_PROMPT_TEXTAREA_CLASS } from "./postSchedulerAiToolkitPromptFieldStyles";
import {
  bindComposerEscapeOverlay,
  COMPOSER_ESCAPE_OVERLAY_ATTR,
} from "./postSchedulerComposerEscapeOverlay";

interface PostSchedulerAiToolkitPromptExpandModalProps {
  readonly open: boolean;
  readonly title: string;
  readonly placeholder: string;
  readonly value: string;
  readonly disabled?: boolean;
  readonly maxLength?: number;
  readonly onChange: (v: string) => void;
  readonly onClose: () => void;
}

export function PostSchedulerAiToolkitPromptExpandModal({
  open,
  title,
  placeholder,
  value,
  disabled,
  maxLength,
  onChange,
  onClose,
}: PostSchedulerAiToolkitPromptExpandModalProps): ReactElement | null {
  const { t } = useTranslations();
  const root = typeof document !== "undefined" ? document.body : null;
  const isOverLimit =
    maxLength !== undefined && value.length > maxLength;

  useEffect(() => bindComposerEscapeOverlay(open, onClose), [open, onClose]);

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
      className="fixed inset-0 z-[260] flex items-center justify-center bg-black/55 p-4 backdrop-blur-sm"
      role="presentation"
      {...{ [COMPOSER_ESCAPE_OVERLAY_ATTR]: true }}
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="ai-toolkit-prompt-expand-title"
        className="flex max-h-[min(92vh,820px)] w-full max-w-3xl flex-col rounded-2xl border border-outline-variant/15 bg-surface-container-low shadow-xl"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="border-b border-outline-variant/10 px-5 py-4">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <h2
                id="ai-toolkit-prompt-expand-title"
                className="text-sm font-bold text-on-surface"
              >
                {title}
              </h2>
              <p className="mt-1 text-xs text-on-surface-variant">
                {t("postScheduler.aiToolkit.expandPromptHint")}
              </p>
            </div>
            <PostSchedulerAiToolkitQuickPromptsTrigger
              variant="compact"
              disabled={disabled}
              onApply={onChange}
            />
          </div>
        </div>

        <div className="custom-scrollbar min-h-0 flex-1 px-5 py-4">
          <textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            disabled={disabled}
            placeholder={placeholder}
            autoFocus
            className={`${AI_TOOLKIT_PROMPT_TEXTAREA_CLASS} min-h-[min(55vh,480px)] resize-y text-sm leading-relaxed${
              isOverLimit ? " border-red-500 bg-red-500/10 focus:ring-red-500/40" : ""
            }`}
          />
          {maxLength !== undefined ? (
            <p
              className={`mt-2 text-right text-[10px] ${
                isOverLimit ? "text-red-400" : "text-neutral-500"
              }`}
            >
              {value.length}/{maxLength}
            </p>
          ) : null}
        </div>

        <div className="flex justify-end gap-2 border-t border-outline-variant/10 px-5 py-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg bg-[#6B49D8] px-4 py-2 text-xs font-bold text-on-primary hover:opacity-95"
          >
            {t("postScheduler.aiToolkit.expandPromptDone")}
          </button>
        </div>
      </div>
    </div>,
    root,
  );
}
