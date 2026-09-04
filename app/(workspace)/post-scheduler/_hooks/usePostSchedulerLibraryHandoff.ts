"use client";

import { useEffect } from "react";

import { appendUnsplashCreditToPostBody } from "@/lib/social/unsplashAttribution";

import { useOptionalPostSchedulerComposerDraft } from "../_context/PostSchedulerComposerDraftContext";
import { mergeAttachedMediaOnPick } from "../_utils/postSchedulerComposerMediaPick";
import { consumeLibraryUseInPost } from "../_utils/postSchedulerLibraryHandoff";

/** Attach a Library "Use in post" pick to the composer once after navigation. */
export function usePostSchedulerLibraryHandoff(enabled = true): void {
  const composerDraft = useOptionalPostSchedulerComposerDraft();

  useEffect(() => {
    if (!enabled || !composerDraft) {
      return;
    }
    const media = consumeLibraryUseInPost();
    if (!media) {
      return;
    }
    if (media.attribution?.provider === "unsplash") {
      composerDraft.setEditorBody(
        appendUnsplashCreditToPostBody(
          composerDraft.editorBody,
          media.attribution,
        ),
      );
    }
    composerDraft.setEditorMedia((prev) => mergeAttachedMediaOnPick(prev, media));
  }, [composerDraft, enabled]);
}
