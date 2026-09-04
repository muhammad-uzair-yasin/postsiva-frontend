"use client";

import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { useTranslations } from "@/lib/i18n/WorkspaceLocaleProvider";

interface DraftEditorCaptionFieldProps {
  caption: string;
  onCaptionChange: (v: string) => void;
  maxLength?: number;
  compact?: boolean;
}

export function DraftEditorCaptionField({
  caption,
  onCaptionChange,
  maxLength,
  compact = false,
}: DraftEditorCaptionFieldProps): React.ReactElement {
  const { t } = useTranslations();
  const [expandOpen, setExpandOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const expandTextareaRef = useRef<HTMLTextAreaElement>(null);

  // Only use portal after mount (SSR-safe)
  useEffect(() => {
    setMounted(true);
  }, []);

  // Focus expand textarea when it opens
  useEffect(() => {
    if (expandOpen) {
      // Small delay so the portal render is committed first
      const id = setTimeout(() => {
        expandTextareaRef.current?.focus();
      }, 50);
      return () => clearTimeout(id);
    }
  }, [expandOpen]);

  // Close on Escape
  useEffect(() => {
    if (!expandOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") setExpandOpen(false);
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [expandOpen]);

  const count =
    maxLength === undefined
      ? caption.length
      : Math.min(caption.length, maxLength);

  const expandModal = mounted && expandOpen
    ? createPortal(
        <div
          role="dialog"
          aria-modal="true"
          aria-label={t("content.draftCaptionLabel")}
          className="fixed inset-0 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
          style={{ zIndex: 99999 }}
          onMouseDown={(e) => {
            // Close only when clicking the backdrop itself
            if (e.target === e.currentTarget) setExpandOpen(false);
          }}
        >
          <div
            className="flex w-full max-w-2xl flex-col rounded-2xl shadow-2xl"
            style={{
              maxHeight: "85vh",
              background: "var(--color-surface, #1e293b)",
              border: "1px solid rgba(255,255,255,0.08)",
            }}
            onMouseDown={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div
              className="flex items-center justify-between px-5 py-4"
              style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}
            >
              <span className="text-sm font-semibold text-on-surface">
                {t("content.draftCaptionLabel")}
              </span>
              <button
                type="button"
                onClick={() => setExpandOpen(false)}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-on-surface-variant transition hover:bg-surface-container-high hover:text-on-surface"
                aria-label="Close expanded editor"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            {/* Textarea */}
            <div className="flex flex-1 flex-col overflow-hidden p-4">
              <textarea
                ref={expandTextareaRef}
                value={caption}
                onChange={(e) => onCaptionChange(e.target.value)}
                className="w-full flex-1 resize-none rounded-xl px-4 py-3 text-sm text-on-surface outline-none ring-primary/30 transition-shadow focus:ring-2"
                style={{
                  minHeight: "360px",
                  background: "var(--color-surface-container-low, #0f172a)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  color: "var(--color-on-surface, #f1f5f9)",
                }}
                placeholder={t("content.draftCaptionPlaceholder")}
                {...(maxLength !== undefined ? { maxLength } : {})}
              />
            </div>

            {/* Footer */}
            <div
              className="flex items-center justify-between px-5 py-3"
              style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }}
            >
              <span className="text-xs text-on-surface-variant">
                {maxLength === undefined ? count : `${count} / ${maxLength}`}
              </span>
              <button
                type="button"
                onClick={() => setExpandOpen(false)}
                className="h-9 rounded-xl bg-primary px-5 text-sm font-semibold text-on-primary transition hover:bg-primary/90"
              >
                Done
              </button>
            </div>
          </div>
        </div>,
        document.body,
      )
    : null;

  return (
    <>
      <div className={compact ? "flex min-h-0 flex-1 flex-col" : undefined}>
        {!compact ? (
          <label
            htmlFor="draft-caption"
            className="mb-2 block text-sm font-semibold text-on-surface"
          >
            {t("content.draftCaptionLabel")}
          </label>
        ) : (
          <label htmlFor="draft-caption" className="sr-only">
            {t("content.draftCaptionLabel")}
          </label>
        )}
        <div className="relative flex-1">
          <textarea
            id="draft-caption"
            value={caption}
            onChange={(e) => onCaptionChange(e.target.value)}
            rows={compact ? 6 : 5}
            className={
              compact
                ? "min-h-[7rem] w-full flex-1 resize-none rounded-xl border border-outline-variant/15 bg-surface-container-low px-3 py-2.5 pr-9 text-sm text-on-surface outline-none ring-primary/30 transition-shadow focus:ring-2"
                : "max-h-40 min-h-[7.5rem] w-full resize-y rounded-2xl border border-outline-variant/15 bg-surface-container-low px-3 py-2.5 pr-9 text-sm text-on-surface outline-none ring-primary/30 transition-shadow focus:ring-2"
            }
            placeholder={t("content.draftCaptionPlaceholder")}
            {...(maxLength !== undefined ? { maxLength } : {})}
          />
          {/* Expand button */}
          <button
            type="button"
            onClick={() => setExpandOpen(true)}
            className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-md text-on-surface-variant transition hover:bg-surface-container-high hover:text-on-surface"
            title="Expand editor"
            aria-label="Expand caption editor"
          >
            <span className="material-symbols-outlined text-[16px]">open_in_new</span>
          </button>
        </div>
        <p className="mt-1 text-right text-xs text-on-surface-variant">
          {maxLength === undefined ? count : `${count} / ${maxLength}`}
        </p>
      </div>

      {expandModal}
    </>
  );
}
