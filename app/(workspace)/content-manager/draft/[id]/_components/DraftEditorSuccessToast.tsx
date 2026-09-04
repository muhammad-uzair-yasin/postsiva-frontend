"use client";

import type { CSSProperties } from "react";
import { useEffect, useState } from "react";

import { useTranslations } from "@/lib/i18n/WorkspaceLocaleProvider";

const AUTO_HIDE_MS = 5000;
const SLIDE_MS = 280;

interface DraftEditorSuccessToastProps {
  title: string;
  subtitle: string;
  onDismiss: () => void;
}

export function DraftEditorSuccessToast({
  title,
  subtitle,
  onDismiss,
}: DraftEditorSuccessToastProps): React.ReactElement | null {
  const { t } = useTranslations();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!title.trim() && !subtitle.trim()) {
      const close = window.setTimeout(() => setOpen(false), 0);
      return () => window.clearTimeout(close);
    }
    const reset = window.setTimeout(() => {
      setOpen(false);
    }, 0);
    const enter = window.setTimeout(() => {
      setOpen(true);
    }, 16);
    const leave = window.setTimeout(() => {
      setOpen(false);
      window.setTimeout(() => {
        onDismiss();
      }, SLIDE_MS);
    }, AUTO_HIDE_MS);
    return () => {
      window.clearTimeout(reset);
      window.clearTimeout(enter);
      window.clearTimeout(leave);
    };
  }, [title, subtitle, onDismiss]);

  if (!title.trim() && !subtitle.trim()) {
    return null;
  }

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed right-5 top-5 z-[130] flex max-w-[min(26rem,calc(100vw-2.5rem))] justify-end pointer-events-none"
    >
      <div
        className={`pointer-events-auto origin-top-right overflow-hidden rounded-2xl border border-outline-variant/30 bg-surface-bright shadow-[0_10px_40px_rgba(0,0,0,0.35),0_2px_8px_rgba(0,0,0,0.2)] transition-[transform,opacity] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none ${
          open
            ? "translate-x-0 translate-y-0 scale-100 opacity-100"
            : "translate-x-6 translate-y-2 scale-[0.96] opacity-0"
        }`}
        style={
          {
            "--draft-toast-ms": `${AUTO_HIDE_MS}ms`,
          } as CSSProperties
        }
      >
        <div className="relative flex items-start gap-4 px-5 pb-4 pt-5 pr-12">
          <button
            type="button"
            onClick={() => {
              setOpen(false);
              window.setTimeout(() => {
                onDismiss();
              }, SLIDE_MS);
            }}
            className="absolute right-3 top-3 rounded-lg p-1 text-on-surface-variant/70 transition-colors hover:bg-surface-container/80 hover:text-on-surface"
            aria-label={t("content.toastDismissAria")}
          >
            <span className="material-symbols-outlined text-xl leading-none">
              close
            </span>
          </button>

          <div
            className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-secondary/14 ring-1 ring-secondary/25"
            aria-hidden
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary-container shadow-inner">
              <span
                className="material-symbols-outlined text-[22px] text-on-secondary-container"
                style={{ fontVariationSettings: '"FILL" 1, "wght" 600' }}
              >
                check
              </span>
            </div>
          </div>

          <div className="min-w-0 flex-1 pt-0.5">
            <p className="text-base font-bold leading-tight text-on-surface">
              {title.trim() || t("content.toastDone")}
            </p>
            <p className="mt-1.5 text-sm leading-relaxed text-on-surface-variant">
              {subtitle.trim()}
            </p>
          </div>
        </div>

        <div className="relative h-2.5 w-full overflow-hidden bg-surface-container/90">
          <div
            className="draft-toast-progress-bar absolute inset-y-0 left-0 w-full origin-left bg-secondary-container"
            aria-hidden
          />
        </div>
      </div>
    </div>
  );
}
