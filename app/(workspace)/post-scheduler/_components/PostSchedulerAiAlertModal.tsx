"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

import { useTranslations } from "@/lib/i18n/WorkspaceLocaleProvider";

interface PostSchedulerAiAlertModalProps {
  visible: boolean;
  title: string;
  message: string;
  onClose: () => void;
}

function renderHighlightedMessage(message: string): React.ReactNode {
  const lines = message.split("\n");
  return lines.map((line, lineIdx) => {
    const parts = line.split(/(\bup to\s+)(\d+\b)/gi);
    return (
      <span key={`line-${lineIdx}`}>
        {parts.map((part, idx) => {
          if (/^\d+$/.test(part)) {
            return (
              <span key={`part-${lineIdx}-${idx}`} className="font-bold text-secondary">
                {part}
              </span>
            );
          }
          return <span key={`part-${lineIdx}-${idx}`}>{part}</span>;
        })}
        {lineIdx < lines.length - 1 ? <br /> : null}
      </span>
    );
  });
}

/** Same copy/structure as mobile `PostComposerAiAlertModal`. */
export function PostSchedulerAiAlertModal({
  visible,
  title,
  message,
  onClose,
}: PostSchedulerAiAlertModalProps): React.ReactElement | null {
  const { t } = useTranslations();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  if (!visible) {
    return null;
  }
  if (!mounted) {
    return null;
  }

  return createPortal(
    <div className="fixed inset-0 z-[1000] bg-black/55">
      <button
        type="button"
        aria-label={t("common.dismiss")}
        className="absolute inset-0 cursor-default"
        onClick={onClose}
      />
      <div className="pointer-events-none fixed left-1/2 top-1/2 w-full max-w-md -translate-x-1/2 -translate-y-1/2 px-5">
        <div
          role="alertdialog"
          aria-modal="true"
          aria-labelledby="post-scheduler-ai-alert-title"
          className="pointer-events-auto relative z-10 w-full rounded-2xl border border-outline-variant/20 bg-surface-container-high p-5 shadow-2xl"
        >
          <h2
            id="post-scheduler-ai-alert-title"
            className="font-headline text-lg font-bold text-on-surface"
          >
            {title}
          </h2>
          <p className="mt-3 whitespace-pre-line font-body text-sm leading-relaxed text-on-surface-variant">
            {renderHighlightedMessage(message)}
          </p>
          <div className="mt-6 flex justify-end">
            <button
              type="button"
              className="rounded-xl bg-primary-container px-5 py-3 font-body text-sm font-bold text-on-primary-container transition-opacity hover:opacity-95"
              onClick={onClose}
            >
              {t("postScheduler.aiToolkit.ok")}
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}
