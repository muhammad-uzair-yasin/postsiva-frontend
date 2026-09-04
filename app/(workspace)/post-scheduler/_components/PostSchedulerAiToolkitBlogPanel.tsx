"use client";

import { useTranslations } from "@/lib/i18n/WorkspaceLocaleProvider";

import { PostSchedulerAiToolkitPromptTextarea } from "./PostSchedulerAiToolkitPromptTextarea";
import { PostSchedulerAiToolkitQuickPromptsTrigger } from "./PostSchedulerAiToolkitQuickPromptsTrigger";

interface PostSchedulerAiToolkitBlogPanelProps {
  readonly input: string;
  readonly onInputChange: (v: string) => void;
  readonly isGenerating: boolean;
  readonly onGenerate: () => void;
}

export function PostSchedulerAiToolkitBlogPanel({
  input,
  onInputChange,
  isGenerating,
  onGenerate,
}: PostSchedulerAiToolkitBlogPanelProps): React.ReactElement {
  const { t } = useTranslations();

  return (
    <div className="mt-1 space-y-3">
      <p className="text-[10px] font-medium uppercase tracking-wide text-on-surface-variant/80">
        {t("postScheduler.aiToolkit.blogToolHint")}
      </p>

      <PostSchedulerAiToolkitQuickPromptsTrigger
        disabled={isGenerating}
        onApply={onInputChange}
      />

      <PostSchedulerAiToolkitPromptTextarea
        label={t("postScheduler.aiToolkit.blogIdeaOrUrlLabel")}
        placeholder={t("postScheduler.aiToolkit.blogIdeaOrUrlPlaceholder")}
        value={input}
        disabled={isGenerating}
        onChange={onInputChange}
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
          ? t("postScheduler.aiToolkit.generating")
          : t("postScheduler.aiToolkit.generateBlog")}
      </button>
    </div>
  );
}
