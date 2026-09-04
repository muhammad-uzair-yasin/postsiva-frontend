"use client";

import type { ReactElement } from "react";

import { useTranslations } from "@/lib/i18n/WorkspaceLocaleProvider";

import type { ComposerAttachedMedia } from "../_types/composerDraftTypes";
import { usePostSchedulerComposerMediaSourceFlow } from "../_hooks/usePostSchedulerComposerMediaSourceFlow";
import { PostSchedulerComposerDashedUploadTrigger } from "./PostSchedulerComposerDashedUploadTrigger";

export function PostSchedulerWordPressBlogFeaturedImageZone({
  featuredImageUrl,
  wordpressConnectionId,
  onPickFeatured,
}: {
  readonly featuredImageUrl: string;
  readonly wordpressConnectionId: string;
  readonly onPickFeatured: (media: ComposerAttachedMedia) => void;
}): ReactElement {
  const { t } = useTranslations();
  const { openSourcePicker, modals } = usePostSchedulerComposerMediaSourceFlow({
    wordpressConnectionId,
    listenToGlobalOpenEvents: false,
    composerHandoffsEnabled: false,
    onPick: (media) => {
      if (media.mediaType === "image" || media.mediaType === "video") {
        onPickFeatured(media);
      }
    },
    onDeviceUpload: (result) => {
      onPickFeatured({
        mediaId: result.mediaId,
        publicUrl: result.publicUrl,
        mediaType: result.mediaType,
        filename: result.filename,
      });
    },
  });

  return (
    <div>
      <p className="mb-2 text-xs font-semibold text-on-surface-variant">
        {t("postScheduler.composer.blogFeaturedImage")}
      </p>
      <PostSchedulerComposerDashedUploadTrigger
        onClick={openSourcePicker}
        previewUrl={featuredImageUrl}
        emptyHint={t("postScheduler.composer.blogFeaturedImageHint")}
        changeLabel={t("postScheduler.composer.blogChangeCover")}
      />
      {modals}
    </div>
  );
}
