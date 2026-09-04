"use client";

import { useTranslations } from "@/lib/i18n/WorkspaceLocaleProvider";

import { PostSchedulerAiToolkitPromptTextarea } from "./PostSchedulerAiToolkitPromptTextarea";
import { PostSchedulerAiToolkitQuickPromptsTrigger } from "./PostSchedulerAiToolkitQuickPromptsTrigger";

interface PostSchedulerAiToolkitImageToContentPanelProps {
  readonly hasImage: boolean;
  readonly imageToContentPrompt: string;
  readonly onImageToContentPromptChange: (v: string) => void;
  readonly isGenerating: boolean;
  readonly onGenerate: () => void;
}

export function PostSchedulerAiToolkitImageToContentPanel({
  hasImage,
  imageToContentPrompt,
  onImageToContentPromptChange,
  isGenerating,
  onGenerate,
}: PostSchedulerAiToolkitImageToContentPanelProps): React.ReactElement {
  const { t } = useTranslations();

  return (
    <div className="mt-2 space-y-3">
      <PostSchedulerAiToolkitQuickPromptsTrigger
        disabled={isGenerating}
        onApply={onImageToContentPromptChange}
      />

      <div>
        <p className="mb-1 text-[10px] font-bold uppercase tracking-wider text-neutral-400">
          {t("postScheduler.aiToolkit.selectedImage")}
        </p>
        <div className="rounded-lg border border-white/10 bg-white/5 px-3 py-2.5">
          <p className="font-body text-[11px] leading-5 text-neutral-200">
            {hasImage
              ? t("postScheduler.aiToolkit.imageInComposer")
              : t("postScheduler.aiToolkit.noImageAttached")}
          </p>
        </div>
      </div>

      <PostSchedulerAiToolkitPromptTextarea
        label={t("postScheduler.aiToolkit.optionalRequirements")}
        placeholder={t("postScheduler.aiToolkit.imageToContentPlaceholder")}
        value={imageToContentPrompt}
        disabled={isGenerating}
        onChange={onImageToContentPromptChange}
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
          : t("postScheduler.aiToolkit.generateContent")}
      </button>
    </div>
  );
}
