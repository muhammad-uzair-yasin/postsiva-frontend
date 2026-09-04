"use client";

import { motion } from "framer-motion";
import { useState, type ReactElement } from "react";

import { useTranslations } from "@/lib/i18n/WorkspaceLocaleProvider";

import { useComposerSessionCacheActions } from "../_context/PostSchedulerComposerSessionCacheProvider";
import { usePostSchedulerComposerDraft } from "../_context/PostSchedulerComposerDraftContext";
import { PostSchedulerComposerClearConfirmModal } from "./PostSchedulerComposerClearConfirmModal";

interface PostSchedulerCreatePostCardHeaderProps {
  readonly aiPanelOpen: boolean;
  readonly aiComposerEnabled: boolean;
  readonly onToggleAi: () => void;
}

export function PostSchedulerCreatePostCardHeader({
  aiPanelOpen,
  aiComposerEnabled,
  onToggleAi,
}: PostSchedulerCreatePostCardHeaderProps): ReactElement {
  const { t } = useTranslations();
  const { livePreviewEnabled, setLivePreviewEnabled } =
    usePostSchedulerComposerDraft();
  const { clearComposerSession } = useComposerSessionCacheActions();
  const [clearOpen, setClearOpen] = useState(false);

  return (
    <>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
        <div className="flex shrink-0 items-center gap-1.5">
          <motion.button
            type="button"
            onClick={() => setClearOpen(true)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="box-border inline-flex h-10 shrink-0 items-center justify-center gap-1.5 rounded-lg border border-outline-variant/30 bg-surface-container-high px-3 text-[11px] font-bold text-on-surface-variant shadow-md transition-colors hover:border-error/40 hover:text-error"
            aria-label={t("composer.clearComposerAria")}
            title={t("composer.clearComposerAria")}
          >
            <span className="material-symbols-outlined text-[19px] leading-none">
              delete_sweep
            </span>
            {t("common.clear")}
          </motion.button>
          <motion.button
            type="button"
            onClick={() => {
              setLivePreviewEnabled((v) => !v);
            }}
            aria-pressed={livePreviewEnabled}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={`box-border inline-flex h-10 shrink-0 items-center justify-center gap-1.5 rounded-lg border px-3 text-[11px] font-bold shadow-md transition-colors motion-reduce:transform-none ${
              livePreviewEnabled
                ? "border-secondary/50 bg-secondary/20 text-secondary ring-2 ring-inset ring-secondary/40"
                : "border-outline-variant/30 bg-surface-container-high text-on-surface-variant hover:border-outline-variant/60"
            }`}
          >
            <span className="material-symbols-outlined text-[19px] leading-none">
              {livePreviewEnabled ? "visibility" : "visibility_off"}
            </span>
            {t("postScheduler.preview.livePreview")}
          </motion.button>
          <motion.button
            type="button"
            onClick={onToggleAi}
            aria-expanded={aiPanelOpen}
            aria-pressed={aiPanelOpen}
            aria-controls="post-scheduler-ai-panel"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={`box-border inline-flex h-10 shrink-0 items-center justify-center gap-1.5 rounded-lg border px-3 text-[11px] font-bold shadow-md transition-colors motion-reduce:transform-none ${
              !aiComposerEnabled
                ? "border-outline-variant/30 bg-surface-container-high text-on-surface-variant"
                : aiPanelOpen
                  ? "border-secondary/50 bg-secondary/20 text-secondary ring-2 ring-inset ring-secondary/40"
                  : "border-primary/35 bg-gradient-to-br from-primary-container/95 to-primary-container/80 text-on-primary-container shadow-primary-container/25 hover:border-primary/50"
            }`}
          >
            <span
              className="material-symbols-outlined text-[19px] leading-none"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              auto_awesome
            </span>
            {aiComposerEnabled ? t("composer.aiAssistant") : t("composer.aiUpgrade")}
          </motion.button>
        </div>
      </div>
      <PostSchedulerComposerClearConfirmModal
        open={clearOpen}
        onClose={() => setClearOpen(false)}
        onConfirm={clearComposerSession}
      />
    </>
  );
}
