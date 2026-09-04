"use client";

import { useMemo, useState, type ReactElement } from "react";

import { useTranslations } from "@/lib/i18n/WorkspaceLocaleProvider";
import { resolveWordPressFeaturedImageUrl } from "@/lib/post-composer/wordpressComposerFields";

import { mergeAttachedMediaOnPick } from "../_utils/postSchedulerComposerMediaPick";
import { wordPressBodyPlainForEditor } from "../_utils/wordpressBlogPlainTextHtml";
import type { ComposerAttachedMedia } from "../_types/composerDraftTypes";
import type { StockMediaItem } from "@/lib/social/stockMediaApi";
import { PostSchedulerWordPressTermDropdown } from "./PostSchedulerWordPressTermDropdown";
import { PostSchedulerWordPressBlogFeaturedImageZone } from "./PostSchedulerWordPressBlogFeaturedImageZone";
import { PostSchedulerWordPressBlogBodyField } from "./PostSchedulerWordPressBlogBodyField";
import { PostSchedulerWordPressRecommendedImages } from "./PostSchedulerWordPressRecommendedImages";
import { TermManageModal } from "../../wordpress/blogs/_components/WordPressResourcePanels";
import { hasInlineMedia } from "../../wordpress/blogs/_components/wordpressArticleParts";
import { useWordPressEditorResources } from "../../wordpress/blogs/_hooks/useWordPressEditorResources";

const inputClass =
  "w-full rounded-lg border border-outline-variant/20 bg-surface-container-lowest px-3 py-2.5 font-body text-sm text-on-surface placeholder:text-outline/45 focus:outline-none focus:ring-2 focus:ring-secondary/25";

export function PostSchedulerWordPressBlogEditorPanel({
  connectionId,
  title,
  slug,
  excerpt,
  categories,
  tags,
  editorBody,
  wordpressContent,
  recommendedImages,
  attachedMedia,
  loading,
  onTitleChange,
  onSlugChange,
  onExcerptChange,
  onCategoriesChange,
  onTagsChange,
  onEditorBodyChange,
  onWordpressContentChange,
  onAttachedMediaChange,
}: {
  readonly connectionId: string;
  readonly title: string;
  readonly slug: string;
  readonly excerpt: string;
  readonly categories: number[];
  readonly tags: number[];
  readonly editorBody: string;
  readonly wordpressContent: string;
  readonly recommendedImages: readonly StockMediaItem[];
  readonly attachedMedia: readonly ComposerAttachedMedia[];
  readonly loading?: boolean;
  readonly onTitleChange: (v: string) => void;
  readonly onSlugChange: (v: string) => void;
  readonly onExcerptChange: (v: string) => void;
  readonly onCategoriesChange: (v: number[]) => void;
  readonly onTagsChange: (v: number[]) => void;
  readonly onEditorBodyChange: (v: string) => void;
  readonly onWordpressContentChange: (v: string) => void;
  readonly onAttachedMediaChange: (
    fn: (prev: readonly ComposerAttachedMedia[]) => ComposerAttachedMedia[],
  ) => void;
}): ReactElement {
  const { t } = useTranslations();
  const resources = useWordPressEditorResources(connectionId);
  const [termModal, setTermModal] = useState<"categories" | "tags" | null>(null);
  const [optionalOpen, setOptionalOpen] = useState(false);

  const featuredUrl = useMemo(
    () => resolveWordPressFeaturedImageUrl(recommendedImages, attachedMedia),
    [attachedMedia, recommendedImages],
  );

  const bodyPlain = useMemo(
    () => wordPressBodyPlainForEditor(wordpressContent, editorBody),
    [editorBody, wordpressContent],
  );

  const optionalActive =
    Boolean(slug.trim()) ||
    Boolean(excerpt.trim()) ||
    categories.length > 0 ||
    tags.length > 0 ||
    recommendedImages.length > 0;

  const toggleTerm = (id: number, selected: boolean, kind: "categories" | "tags"): void => {
    const current = kind === "categories" ? categories : tags;
    const next = selected
      ? Array.from(new Set([...current, id]))
      : current.filter((item) => item !== id);
    if (kind === "categories") {
      onCategoriesChange(next);
    } else {
      onTagsChange(next);
    }
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-y-auto postsiva-scrollbar pr-1">
      <h2 className="mb-5 shrink-0 font-headline text-2xl font-bold tracking-tight text-on-surface">
        {t("postScheduler.composer.blogEditorHeading")}
      </h2>

      <div className="space-y-5">
        <div>
          <label className="mb-1.5 block text-xs font-semibold text-on-surface-variant">
            {t("postScheduler.composer.blogContentTitle")}
          </label>
          <input
            value={title}
            onChange={(e) => onTitleChange(e.target.value)}
            disabled={loading}
            placeholder={t("postScheduler.composer.blogContentTitlePlaceholder")}
            className={`${inputClass} text-base font-medium`}
          />
        </div>

        <PostSchedulerWordPressBlogFeaturedImageZone
          featuredImageUrl={featuredUrl}
          wordpressConnectionId={connectionId}
          onPickFeatured={(media) => {
            onAttachedMediaChange((prev) => mergeAttachedMediaOnPick(prev, media));
          }}
        />

        <div className="rounded-xl border border-outline-variant/15 bg-surface-container-low/30">
          <button
            type="button"
            aria-expanded={optionalOpen}
            onClick={() => setOptionalOpen((open) => !open)}
            className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left transition hover:bg-surface-container-low/50"
          >
            <span className="flex min-w-0 flex-col gap-0.5">
              <span className="text-sm font-bold text-on-surface">
                {t("postScheduler.composer.blogOptionalSettings")}
              </span>
              <span className="text-xs text-on-surface-variant">
                {t("postScheduler.composer.blogOptionalSettingsHint")}
              </span>
            </span>
            <span className="flex shrink-0 items-center gap-2">
              {optionalActive && !optionalOpen ? (
                <span className="rounded-full bg-secondary/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-secondary">
                  {t("postScheduler.composer.blogOptionalSettingsActive")}
                </span>
              ) : null}
              <span
                className={`material-symbols-outlined text-[22px] text-on-surface-variant transition ${
                  optionalOpen ? "rotate-180" : ""
                }`}
              >
                expand_more
              </span>
            </span>
          </button>
          {optionalOpen ? (
            <div className="space-y-4 border-t border-outline-variant/10 px-4 py-4">
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-on-surface-variant">
                  {t("postScheduler.composer.blogUrlSlug")}
                </label>
                <input
                  value={slug}
                  onChange={(e) => onSlugChange(e.target.value)}
                  disabled={loading}
                  placeholder={t("postScheduler.composer.blogUrlSlugPlaceholder")}
                  className={inputClass}
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-on-surface-variant">
                  {t("postScheduler.composer.blogMetaDescription")}
                </label>
                <textarea
                  value={excerpt}
                  onChange={(e) => onExcerptChange(e.target.value)}
                  disabled={loading}
                  rows={3}
                  placeholder={t("postScheduler.composer.wordpressExcerptPlaceholder")}
                  className={`${inputClass} min-h-[5rem] resize-y leading-relaxed`}
                />
              </div>
              {recommendedImages.length > 0 ? (
                <div className="rounded-lg border border-outline-variant/10 bg-surface-container-low/40 p-3">
                  <PostSchedulerWordPressRecommendedImages
                    images={recommendedImages}
                    onPick={(media) => {
                      onAttachedMediaChange((prev) => mergeAttachedMediaOnPick(prev, media));
                    }}
                  />
                </div>
              ) : null}
              <div className="grid gap-4 sm:grid-cols-2">
                <PostSchedulerWordPressTermDropdown
                  label={t("postScheduler.composer.wordpressCategories")}
                  placeholder={t("postScheduler.composer.wordpressCategories")}
                  loadingLabel={t("postScheduler.composer.wordpressLoadingCategories")}
                  terms={resources.categories}
                  selected={categories}
                  loading={resources.loading || Boolean(loading)}
                  refreshTitle={t("postScheduler.composer.wordpressRefreshTerms")}
                  addTitle={t("postScheduler.composer.wordpressAddCategory")}
                  onRefresh={() => void resources.refresh(true)}
                  onAdd={() => setTermModal("categories")}
                  onToggle={(id, selected) => toggleTerm(id, selected, "categories")}
                />
                <PostSchedulerWordPressTermDropdown
                  label={t("postScheduler.composer.wordpressTags")}
                  placeholder={t("postScheduler.composer.wordpressTags")}
                  loadingLabel={t("postScheduler.composer.wordpressLoadingTags")}
                  terms={resources.tags}
                  selected={tags}
                  loading={resources.loading || Boolean(loading)}
                  refreshTitle={t("postScheduler.composer.wordpressRefreshTerms")}
                  addTitle={t("postScheduler.composer.wordpressAddTag")}
                  onRefresh={() => void resources.refresh(true)}
                  onAdd={() => setTermModal("tags")}
                  onToggle={(id, selected) => toggleTerm(id, selected, "tags")}
                />
              </div>
            </div>
          ) : null}
        </div>
      </div>

      <PostSchedulerWordPressBlogBodyField
        body={bodyPlain}
        loading={loading}
        onBodyChange={(plain, html) => {
          onEditorBodyChange(plain);
          if (!hasInlineMedia(wordpressContent)) {
            onWordpressContentChange(html);
          }
        }}
      />

      {termModal ? (
        <TermManageModal
          kind={termModal}
          title={
            termModal === "categories"
              ? t("postScheduler.composer.wordpressCategories")
              : t("postScheduler.composer.wordpressTags")
          }
          terms={termModal === "categories" ? resources.categories : resources.tags}
          resources={resources}
          onClose={() => setTermModal(null)}
          onDeleted={(id) => {
            if (termModal === "categories") {
              onCategoriesChange(categories.filter((item) => item !== id));
            } else {
              onTagsChange(tags.filter((item) => item !== id));
            }
          }}
        />
      ) : null}
    </div>
  );
}
