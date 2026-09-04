"use client";

import type { ReactElement } from "react";

import { useTranslations } from "@/lib/i18n/WorkspaceLocaleProvider";
import type { ComposerAttachedMedia } from "@/lib/post-composer/composerAttachedMediaTypes";

import { PostSchedulerComposerMediaModalShell } from "./PostSchedulerComposerMediaModalShell";
import { PostSchedulerMediaLibraryPanel } from "./PostSchedulerMediaLibraryPanel";

/**
 * Almost full-screen Postsiva workspace library for the composer "From library" flow.
 */
export function PostSchedulerMediaLibraryModal({
  visible,
  onClose,
  onPickMedia,
  overlayClassName = "z-[1090]",
  onBack,
}: {
  visible: boolean;
  onClose: () => void;
  onPickMedia?: (media: ComposerAttachedMedia) => void;
  overlayClassName?: string;
  onBack?: () => void;
}): ReactElement | null {
  const { t } = useTranslations();

  return (
    <PostSchedulerComposerMediaModalShell
      visible={visible}
      title={t("postScheduler.mediaLibrary.modalTitle")}
      titleId="composer-media-library-title"
      overlayClassName={overlayClassName}
      onClose={onClose}
      onBack={onBack}
    >
      <PostSchedulerMediaLibraryPanel
        embedded
        masonry
        hideSelection
        onPickMedia={
          onPickMedia
            ? (media) => {
                onPickMedia(media);
                onClose();
              }
            : undefined
        }
      />
    </PostSchedulerComposerMediaModalShell>
  );
}
