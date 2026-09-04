"use client";

import { useRouter } from "next/navigation";
import { useEffect, type ReactElement } from "react";
import { createPortal } from "react-dom";

import { useWorkspaceComposerModal } from "@/app/(workspace)/_components/WorkspaceComposerModalProvider";
import { useTranslations } from "@/lib/i18n/WorkspaceLocaleProvider";
import type { WorkspaceAiPrompt } from "@/lib/settings/workspaceAiPromptsApi";

import {
  bindComposerEscapeOverlay,
  COMPOSER_ESCAPE_OVERLAY_ATTR,
} from "./postSchedulerComposerEscapeOverlay";

interface PostSchedulerAiQuickPromptsModalProps {
  readonly open: boolean;
  readonly loading: boolean;
  readonly items: readonly WorkspaceAiPrompt[];
  readonly onClose: () => void;
  readonly onUse: (prompt: WorkspaceAiPrompt) => void;
}

export function PostSchedulerAiQuickPromptsModal({
  open,
  loading,
  items,
  onClose,
  onUse,
}: PostSchedulerAiQuickPromptsModalProps): ReactElement | null {
  const { t } = useTranslations();
  const router = useRouter();
  const { closeComposer } = useWorkspaceComposerModal();
  const root = typeof document !== "undefined" ? document.body : null;

  const goToAiPromptsSettings = (): void => {
    onClose();
    closeComposer();
    router.push("/settings/ai");
  };

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
      className="fixed inset-0 z-[270] flex items-center justify-center bg-black/55 p-4 backdrop-blur-sm"
      role="presentation"
      {...{ [COMPOSER_ESCAPE_OVERLAY_ATTR]: true }}
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="ai-quick-prompts-title"
        className="flex max-h-[min(85vh,640px)] w-full max-w-lg flex-col rounded-2xl border border-outline-variant/15 bg-surface-container-low shadow-xl"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="border-b border-outline-variant/10 px-5 py-4">
          <h2 id="ai-quick-prompts-title" className="text-sm font-bold text-on-surface">
            {t("postScheduler.aiToolkit.quickPromptsModalTitle")}
          </h2>
          <p className="mt-1 text-xs text-on-surface-variant">
            {t("postScheduler.aiToolkit.quickPromptsModalHint")}
          </p>
        </div>

        <div className="custom-scrollbar min-h-0 flex-1 overflow-y-auto px-5 py-3">
          {loading ? (
            <p className="py-6 text-center text-xs text-on-surface-variant">{t("common.loading")}</p>
          ) : null}
          {!loading && items.length === 0 ? (
            <p className="py-6 text-center text-xs text-on-surface-variant">
              {t("postScheduler.aiToolkit.quickPromptsEmpty")}
            </p>
          ) : null}
          {!loading && items.length > 0 ? (
            <ul className="space-y-2" role="list">
              {items.map((p) => (
                <li key={p.id}>
                  <button
                    type="button"
                    onClick={() => {
                      onUse(p);
                      onClose();
                    }}
                    className="w-full rounded-xl border border-outline-variant/15 bg-surface-container p-3 text-left transition-colors hover:border-primary/30 hover:bg-surface-container-high"
                  >
                    <p className="text-xs font-bold text-on-surface">{p.title}</p>
                    <p className="mt-1 line-clamp-3 whitespace-pre-wrap text-[11px] text-on-surface-variant">
                      {p.body}
                    </p>
                    <span className="mt-2 inline-block text-[10px] font-bold uppercase tracking-wide text-[#6B49D8]">
                      {t("postScheduler.aiToolkit.quickPromptsUse")}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          ) : null}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-outline-variant/10 px-5 py-3">
          <button
            type="button"
            onClick={goToAiPromptsSettings}
            className="text-[11px] font-semibold text-[#6B49D8] hover:underline"
          >
            {t("postScheduler.aiToolkit.quickPromptsManage")}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg px-3 py-2 text-xs font-bold text-on-surface-variant hover:bg-surface-container-high"
          >
            {t("common.close")}
          </button>
        </div>
      </div>
    </div>,
    root,
  );
}
