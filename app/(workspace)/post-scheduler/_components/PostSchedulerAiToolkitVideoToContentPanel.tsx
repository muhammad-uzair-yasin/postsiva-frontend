"use client";

import { useTranslations } from "@/lib/i18n/WorkspaceLocaleProvider";

import { PostSchedulerAiToolkitPromptTextarea } from "./PostSchedulerAiToolkitPromptTextarea";
import { PostSchedulerAiToolkitQuickPromptsTrigger } from "./PostSchedulerAiToolkitQuickPromptsTrigger";

interface PostSchedulerAiToolkitVideoToContentPanelProps {
  readonly hasVideo: boolean;
  readonly videoToContentPrompt: string;
  readonly onVideoToContentPromptChange: (v: string) => void;
  readonly isGenerating: boolean;
  readonly onGenerate: () => void;
}

const MAX_CHARS = 300;

export function PostSchedulerAiToolkitVideoToContentPanel({
  hasVideo,
  videoToContentPrompt,
  onVideoToContentPromptChange,
  isGenerating,
  onGenerate,
}: PostSchedulerAiToolkitVideoToContentPanelProps): React.ReactElement {
  const { t } = useTranslations();
  const isOverLimit = videoToContentPrompt.length > MAX_CHARS;

  return (
    <div className="mt-2 space-y-3">
      <PostSchedulerAiToolkitQuickPromptsTrigger
        disabled={isGenerating}
        onApply={onVideoToContentPromptChange}
      />

      <div>
        <p className="mb-1 text-[10px] font-bold uppercase tracking-wider text-neutral-400">
          {t("postScheduler.aiToolkit.selectedVideo")}
        </p>
        <div className="rounded-lg border border-white/10 bg-white/5 px-3 py-2.5">
          <p className="font-body text-[11px] leading-5 text-neutral-200">
            {hasVideo
              ? t("postScheduler.aiToolkit.videoInComposer")
              : t("postScheduler.aiToolkit.noVideoAttached")}
          </p>
        </div>
      </div>

      <PostSchedulerAiToolkitPromptTextarea
        label={t("postScheduler.aiToolkit.optionalRequirements")}
        placeholder={t("postScheduler.aiToolkit.videoToContentPlaceholder")}
        value={videoToContentPrompt}
        disabled={isGenerating}
        maxLength={MAX_CHARS}
        onChange={onVideoToContentPromptChange}
      />

      <button
        type="button"
        disabled={isGenerating || isOverLimit}
        onClick={onGenerate}
        className={`w-full rounded-lg py-2.5 font-body text-xs font-bold text-on-primary transition-opacity ${
          isGenerating || isOverLimit
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
