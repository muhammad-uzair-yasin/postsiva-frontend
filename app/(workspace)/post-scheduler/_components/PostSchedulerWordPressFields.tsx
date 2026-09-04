"use client";

import { useId, useState, type ReactElement } from "react";

import { useTranslations } from "@/lib/i18n/WorkspaceLocaleProvider";
import { SocialPlatformIcon } from "@/lib/social/SocialPlatformIcon";
import { TermManageModal } from "../../wordpress/blogs/_components/WordPressResourcePanels";
import { useWordPressEditorResources } from "../../wordpress/blogs/_hooks/useWordPressEditorResources";
import { PostSchedulerWordPressTermDropdown } from "./PostSchedulerWordPressTermDropdown";

const fieldShell =
  "rounded-xl border border-outline-variant/15 bg-surface-container-low/80 px-4 py-3";
const fieldLabel =
  "mb-1 flex items-center gap-2 text-[10px] font-extrabold uppercase tracking-widest text-on-surface-variant";
const fieldInput =
  "mt-2 w-full rounded-lg border border-outline-variant/20 bg-surface-container-lowest px-3 py-2.5 font-body text-sm text-on-surface placeholder:text-outline/45 focus:outline-none focus:ring-2 focus:ring-secondary/25";

interface PostSchedulerWordPressFieldsProps {
  readonly connectionId: string;
  readonly title: string;
  readonly slug: string;
  readonly excerpt: string;
  readonly categories: number[];
  readonly tags: number[];
  readonly loading?: boolean;
  readonly onTitleChange: (value: string) => void;
  readonly onSlugChange: (value: string) => void;
  readonly onExcerptChange: (value: string) => void;
  readonly onCategoriesChange: (value: number[]) => void;
  readonly onTagsChange: (value: number[]) => void;
}

export function PostSchedulerWordPressFields({
  connectionId,
  title,
  slug,
  excerpt,
  categories,
  tags,
  loading = false,
  onTitleChange,
  onSlugChange,
  onExcerptChange,
  onCategoriesChange,
  onTagsChange,
}: PostSchedulerWordPressFieldsProps): ReactElement {
  const { t } = useTranslations();
  const titleId = useId();
  const slugId = useId();
  const excerptId = useId();
  const [termModal, setTermModal] = useState<"categories" | "tags" | null>(null);
  const resources = useWordPressEditorResources(connectionId);

  const toggleTerm = (
    id: number,
    selected: boolean,
    kind: "categories" | "tags",
  ): void => {
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
    <div className="space-y-4" aria-label={t("postScheduler.composer.wordpressFields")}>
      <div className={fieldShell}>
        <label htmlFor={titleId} className={fieldLabel}>
          <SocialPlatformIcon platform="wordpress" className="h-4 w-4 shrink-0" alt="" />
          {t("postScheduler.composer.wordpressTitle")}
        </label>
        <input
          id={titleId}
          value={title}
          onChange={(event) => onTitleChange(event.target.value)}
          placeholder={t("postScheduler.composer.wordpressTitlePlaceholder")}
          disabled={loading}
          className={fieldInput}
        />
      </div>

      <div className={`${fieldShell} grid gap-4`}>
        <div>
          <label htmlFor={slugId} className={fieldLabel}>
            {t("postScheduler.composer.wordpressSlug")}
          </label>
          <input
            id={slugId}
            value={slug}
            onChange={(event) => onSlugChange(event.target.value)}
            placeholder={t("postScheduler.composer.wordpressSlugPlaceholder")}
            disabled={loading}
            className={fieldInput}
          />
        </div>
        <div>
          <label htmlFor={excerptId} className={fieldLabel}>
            {t("postScheduler.composer.wordpressExcerpt")}
          </label>
          <textarea
            id={excerptId}
            value={excerpt}
            onChange={(event) => onExcerptChange(event.target.value)}
            placeholder={t("postScheduler.composer.wordpressExcerptPlaceholder")}
            disabled={loading}
            rows={3}
            className={`${fieldInput} min-h-[5.5rem] resize-y leading-relaxed`}
          />
        </div>
      </div>

      <div className={`${fieldShell} grid gap-4 sm:grid-cols-2`}>
        <PostSchedulerWordPressTermDropdown
          label={t("postScheduler.composer.wordpressCategories")}
          placeholder={t("postScheduler.composer.wordpressCategories")}
          loadingLabel={t("postScheduler.composer.wordpressLoadingCategories")}
          terms={resources.categories}
          selected={categories}
          loading={resources.loading || loading}
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
          loading={resources.loading || loading}
          refreshTitle={t("postScheduler.composer.wordpressRefreshTerms")}
          addTitle={t("postScheduler.composer.wordpressAddTag")}
          onRefresh={() => void resources.refresh(true)}
          onAdd={() => setTermModal("tags")}
          onToggle={(id, selected) => toggleTerm(id, selected, "tags")}
        />
      </div>

      {resources.error ? (
        <p className="text-xs text-error">{resources.error}</p>
      ) : null}

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
