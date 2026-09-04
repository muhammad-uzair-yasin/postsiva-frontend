"use client";

import { useTranslations } from "@/lib/i18n/WorkspaceLocaleProvider";

import { PostSchedulerImageGenerationTimer } from "./PostSchedulerImageGenerationTimer";
import { PostSchedulerAiToolkitPromptTextarea } from "./PostSchedulerAiToolkitPromptTextarea";
import { PostSchedulerAiToolkitQuickPromptsTrigger } from "./PostSchedulerAiToolkitQuickPromptsTrigger";

interface PostSchedulerAiToolkitImageGenPanelProps {
  readonly selectedContentPreview: string;
  readonly imageGenPrompt: string;
  readonly onImageGenPromptChange: (v: string) => void;
  readonly isGenerating: boolean;
  readonly onGenerate: () => void;
}

export function PostSchedulerAiToolkitImageGenPanel({
  selectedContentPreview,
  imageGenPrompt,
  onImageGenPromptChange,
  isGenerating,
  onGenerate,
}: PostSchedulerAiToolkitImageGenPanelProps): React.ReactElement {
  const { t } = useTranslations();

  return (
    <div className="mt-2 space-y-3">
      <PostSchedulerAiToolkitQuickPromptsTrigger
        disabled={isGenerating}
        onApply={onImageGenPromptChange}
      />

      <div>
        <p className="mb-1 text-[10px] font-bold uppercase tracking-wider text-neutral-400">
          {t("postScheduler.aiToolkit.selectedContent")}
        </p>
        <div className="rounded-lg border border-white/10 bg-white/5 px-3 py-2.5">
          <p className="line-clamp-3 font-body text-[11px] leading-5 text-neutral-200">
            {selectedContentPreview || t("postScheduler.aiToolkit.noContentSelected")}
          </p>
        </div>
      </div>

      <PostSchedulerAiToolkitPromptTextarea
        label={t("postScheduler.aiToolkit.optionalRequirements")}
        placeholder={t("postScheduler.aiToolkit.imageGenPlaceholder")}
        value={imageGenPrompt}
        disabled={isGenerating}
        onChange={onImageGenPromptChange}
      />

      <PostSchedulerImageGenerationTimer isGenerating={isGenerating} />
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
          : t("postScheduler.aiToolkit.generateImage")}
      </button>
    </div>
  );
}
