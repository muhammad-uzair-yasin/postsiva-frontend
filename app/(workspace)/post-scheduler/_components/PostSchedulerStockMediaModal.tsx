"use client";

import type { ReactElement } from "react";

import { useTranslations } from "@/lib/i18n/WorkspaceLocaleProvider";
import type { ComposerAttachedMedia } from "@/lib/post-composer/composerAttachedMediaTypes";
import { appendUnsplashCreditToPostBody } from "@/lib/social/unsplashAttribution";

import { StockMediaSection } from "../../library/_components/StockMediaSection";
import { useOptionalPostSchedulerComposerDraft } from "../_context/PostSchedulerComposerDraftContext";
import { mergeAttachedMediaOnPick } from "../_utils/postSchedulerComposerMediaPick";
import { PostSchedulerComposerMediaModalShell } from "./PostSchedulerComposerMediaModalShell";

/** Almost full-screen stock media picker for the composer. */
export function PostSchedulerStockMediaModal({
  visible,
  onClose,
  onPickMedia,
  onBack,
  overlayClassName = "z-[1090]",
}: {
  visible: boolean;
  onClose: () => void;
  onPickMedia?: (media: ComposerAttachedMedia) => void;
  onBack?: () => void;
  overlayClassName?: string;
}): ReactElement | null {
  const { t } = useTranslations();
  const composerDraft = useOptionalPostSchedulerComposerDraft();

  const attachStock = (media: ComposerAttachedMedia): void => {
    if (composerDraft && media.attribution?.provider === "unsplash") {
      composerDraft.setEditorBody(
        appendUnsplashCreditToPostBody(
          composerDraft.editorBody,
          media.attribution,
        ),
      );
    }
    if (onPickMedia) {
      onPickMedia(media);
      onClose();
      return;
    }
    composerDraft?.setEditorMedia((prev) => mergeAttachedMediaOnPick(prev, media));
    onClose();
  };

  return (
    <PostSchedulerComposerMediaModalShell
      visible={visible}
      title={t("postScheduler.mediaLibrary.stockModalTitle")}
      titleId="composer-stock-media-title"
      overlayClassName={overlayClassName}
      onClose={onClose}
      onBack={onBack}
    >
      <div className="media-library-scrollbar min-h-0 flex-1 overflow-y-auto overscroll-contain">
        <StockMediaSection onSavedToLibrary={() => undefined} onPickStock={attachStock} />
      </div>
    </PostSchedulerComposerMediaModalShell>
  );
}
