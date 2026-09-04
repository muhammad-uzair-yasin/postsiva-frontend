import type { ComposerAttachedMedia } from "./composerAttachedMediaTypes";
import type { WordPressComposerFields } from "./buildComposerPostJobs";
import { mergeWordPressAttachedMediaFields } from "./inferWordPressComposerPostKind";
import { buildWordPressComposerFields } from "./wordpressComposerFields";
import type { StockMediaItem } from "@/lib/social/stockMediaApi";

const DEFAULT_TEXT_MAX = 3000;

function wordpressDefaultText(content: string, excerpt: string, title: string): string {
  const full = content.trim();
  if (full.length <= DEFAULT_TEXT_MAX) {
    return full;
  }
  const short = excerpt.trim() || title.trim() || full.slice(0, 500);
  return short.slice(0, DEFAULT_TEXT_MAX);
}

function buildWordPressBlock(
  connectionId: string,
  fields: WordPressComposerFields,
): Record<string, unknown> {
  const block: Record<string, unknown> = {
    connection_id: connectionId,
    wordpress_title: fields.title.trim(),
    wordpress_content: fields.content.trim(),
    wordpress_excerpt: fields.excerpt.trim(),
    wordpress_slug: fields.slug.trim(),
    media_placement: fields.mediaPlacement ?? "after_headings",
  };
  if (fields.categories.length > 0) {
    block.categories = [...fields.categories];
  }
  if (fields.tags.length > 0) {
    block.tags = [...fields.tags];
  }
  const featuredId = fields.featuredMediaId?.trim();
  if (featuredId) {
    block.featured_media_id = featuredId;
  }
  const featuredUrl = fields.featuredImageUrl?.trim();
  if (featuredUrl) {
    block.featured_image_url = featuredUrl;
  }
  return block;
}

export function buildWordPressUnifiedPatchBody(input: {
  readonly connectionId: string;
  readonly title: string;
  readonly slug: string;
  readonly content: string;
  readonly excerpt: string;
  readonly categories: readonly number[];
  readonly tags: readonly number[];
  readonly suggestedCategoryNames: readonly string[];
  readonly suggestedTagNames: readonly string[];
  readonly media: readonly ComposerAttachedMedia[];
  readonly featuredMediaId?: string | null;
  readonly recommendedImages?: readonly StockMediaItem[];
}): Record<string, unknown> {
  const fields = buildWordPressComposerFields({
    title: input.title,
    slug: input.slug,
    content: input.content,
    excerpt: input.excerpt,
    categories: input.categories,
    tags: input.tags,
    suggestedCategoryNames: input.suggestedCategoryNames,
    suggestedTagNames: input.suggestedTagNames,
    recommendedImages: input.recommendedImages ?? [],
    attachedMedia: input.media,
    featuredMediaId: input.featuredMediaId ?? null,
  });

  const wpFields: WordPressComposerFields = {
    title: fields.title,
    slug: fields.slug,
    content: fields.content,
    excerpt: fields.excerpt,
    categories: fields.categories,
    tags: fields.tags,
    suggestedCategoryNames: fields.suggestedCategoryNames,
    suggestedTagNames: fields.suggestedTagNames,
    featuredMediaId: fields.featuredMediaId,
    featuredImageUrl: fields.featuredImageUrl,
    mediaPlacement: "after_headings",
  };

  const base: Record<string, unknown> = {
    default_text: wordpressDefaultText(
      fields.content,
      fields.excerpt,
      fields.title,
    ),
    wordpress: buildWordPressBlock(input.connectionId.trim(), wpFields),
  };

  return mergeWordPressAttachedMediaFields(base, input.media);
}
