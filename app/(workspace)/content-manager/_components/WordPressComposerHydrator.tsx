"use client";

import { useEffect, useRef } from "react";

import { usePostSchedulerComposerDraft } from "../../post-scheduler/_context/PostSchedulerComposerDraftContext";
import type { WordPressComposerHydratedState } from "@/lib/post-composer/hydrateWordPressComposerFromPostData";
import { wordpressPlainTextFromHtml } from "@/lib/post-composer/wordpressPlainTextFromHtml";

/** One-shot hydrate composer draft context from a WordPress draft/scheduled row. */
export function WordPressComposerHydrator({
  state,
}: {
  state: WordPressComposerHydratedState;
}): null {
  const hydratedRef = useRef(false);
  const {
    setEditorBody,
    setEditorMedia,
    setWordpressTitle,
    setWordpressSlug,
    setWordpressContent,
    setWordpressExcerpt,
    setWordpressCategories,
    setWordpressTags,
    setWordpressSuggestedCategoryNames,
    setWordpressSuggestedTagNames,
  } = usePostSchedulerComposerDraft();

  useEffect(() => {
    if (hydratedRef.current) {
      return;
    }
    hydratedRef.current = true;
    setWordpressTitle(state.title);
    setWordpressSlug(state.slug);
    setWordpressContent(state.content);
    setWordpressExcerpt(state.excerpt);
    setWordpressCategories([...state.categories]);
    setWordpressTags([...state.tags]);
    setWordpressSuggestedCategoryNames([...state.suggestedCategoryNames]);
    setWordpressSuggestedTagNames([...state.suggestedTagNames]);
    const plainBody =
      wordpressPlainTextFromHtml(state.content) ||
      state.excerpt.trim() ||
      state.title.trim();
    setEditorBody(plainBody);
    setEditorMedia([...state.media]);
  }, [
    setEditorBody,
    setEditorMedia,
    setWordpressCategories,
    setWordpressContent,
    setWordpressExcerpt,
    setWordpressSlug,
    setWordpressSuggestedCategoryNames,
    setWordpressSuggestedTagNames,
    setWordpressTags,
    setWordpressTitle,
    state,
  ]);

  return null;
}
