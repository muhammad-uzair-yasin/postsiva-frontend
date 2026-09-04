"use client";

import { useState, type ReactElement } from "react";

import { useTranslations } from "@/lib/i18n/WorkspaceLocaleProvider";

import { usePostSchedulerAiToolkitQuickPrompts } from "../_context/PostSchedulerAiToolkitQuickPromptsContext";
import { PostSchedulerAiPromptSaveModal } from "./PostSchedulerAiPromptSaveModal";
import { PostSchedulerAiToolkitPromptTextarea } from "./PostSchedulerAiToolkitPromptTextarea";
import { PostSchedulerAiToolkitQuickPromptsTrigger } from "./PostSchedulerAiToolkitQuickPromptsTrigger";

interface PostSchedulerAiToolkitIdeasPanelProps {
  readonly ideaPrompt: string;
  readonly onIdeaPromptChange: (v: string) => void;
  readonly isGenerating: boolean;
  readonly onGenerate: () => void;
}

export function PostSchedulerAiToolkitIdeasPanel({
  ideaPrompt,
  onIdeaPromptChange,
  isGenerating,
  onGenerate,
}: PostSchedulerAiToolkitIdeasPanelProps): React.ReactElement {
  const { t } = useTranslations();
  const { items, saving, error, create, reload } =
    usePostSchedulerAiToolkitQuickPrompts();
  const [saveOpen, setSaveOpen] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [activePromptId, setActivePromptId] = useState<string | null>(null);

  const trimmed = ideaPrompt.trim();
  const canSave = trimmed.length > 0 && !isGenerating;

  return (
    <div className="mt-2 space-y-3">
      <PostSchedulerAiToolkitQuickPromptsTrigger
        disabled={isGenerating}
        onApply={(body) => {
          onIdeaPromptChange(body);
          setActivePromptId(null);
        }}
      />

      <PostSchedulerAiToolkitPromptTextarea
        label={t("postScheduler.aiToolkit.describeIdea")}
        placeholder={t("postScheduler.aiToolkit.ideaPlaceholder")}
        value={ideaPrompt}
        disabled={isGenerating}
        onChange={(text) => {
          onIdeaPromptChange(text);
          if (activePromptId) {
            const row = items.find((p) => p.id === activePromptId);
            if (row && text !== row.body) setActivePromptId(null);
          }
        }}
        belowField={
          canSave ? (
            <button
              type="button"
              disabled={saving}
              onClick={() => {
                setSaveError(null);
                setSaveOpen(true);
              }}
              className="mt-2 text-left text-[11px] font-semibold text-[#6B49D8] hover:underline disabled:opacity-50"
            >
              {t("postScheduler.aiToolkit.savePromptCta")}
            </button>
          ) : null
        }
      />

      <button
        type="button"
        disabled={isGenerating}
        onClick={onGenerate}
        className={`w-full rounded-lg py-2.5 font-body text-xs font-bold text-on-primary transition-opacity ${
          isGenerating
            ? "cursor-not-allowed bg-on-surface/20"
            : "bg-[#6B49D8] hover:opacity-95"
        }`}
      >
        {isGenerating
          ? t("common.loading")
          : t("postScheduler.aiToolkit.generatePost")}
      </button>

      <PostSchedulerAiPromptSaveModal
        open={saveOpen}
        saving={saving}
        error={saveError ?? error}
        onClose={() => {
          if (!saving) setSaveOpen(false);
        }}
        onSave={async (title) => {
          setSaveError(null);
          try {
            const row = await create(title, trimmed);
            setSaveOpen(false);
            setActivePromptId(row.id);
            await reload();
          } catch (e) {
            setSaveError(
              e instanceof Error
                ? e.message
                : t("postScheduler.aiToolkit.savePromptFailed"),
            );
          }
        }}
      />
    </div>
  );
}
