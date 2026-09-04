"use client";

import { useTranslations } from "@/lib/i18n/WorkspaceLocaleProvider";

import { PostSchedulerAiToolkitPromptTextarea } from "./PostSchedulerAiToolkitPromptTextarea";
import { PostSchedulerAiToolkitQuickPromptsTrigger } from "./PostSchedulerAiToolkitQuickPromptsTrigger";

interface PostSchedulerAiToolkitEditImagePanelProps {
  readonly hasImage: boolean;
  readonly editPrompt: string;
  readonly onEditPromptChange: (v: string) => void;
  readonly isEditing: boolean;
  readonly onEdit: () => void;
}

export function PostSchedulerAiToolkitEditImagePanel({
  hasImage,
  editPrompt,
  onEditPromptChange,
  isEditing,
  onEdit,
}: PostSchedulerAiToolkitEditImagePanelProps): React.ReactElement {
  const { t } = useTranslations();

  return (
    <div className="mt-2 space-y-3">
      <PostSchedulerAiToolkitQuickPromptsTrigger
        disabled={isEditing}
        onApply={onEditPromptChange}
      />

      <PostSchedulerAiToolkitPromptTextarea
        label={t("postScheduler.aiToolkit.optionalRequirements")}
        placeholder={t("postScheduler.aiToolkit.editImagePlaceholder")}
        value={editPrompt}
        disabled={isEditing}
        onChange={onEditPromptChange}
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

      <button
        type="button"
        disabled={isEditing}
        onClick={onEdit}
        className={`w-full rounded-lg py-2.5 font-body text-xs font-bold text-on-primary transition-opacity ${
          isEditing
            ? "cursor-not-allowed bg-on-surface/20"
            : "bg-[#6B49D8] hover:opacity-95"
        }`}
      >
        {isEditing
          ? t("postScheduler.aiToolkit.processing")
          : t("postScheduler.aiToolkit.processEdit")}
      </button>
    </div>
  );
}
