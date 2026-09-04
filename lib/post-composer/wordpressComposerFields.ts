import type { ComposerAttachedMedia } from "./composerAttachedMediaTypes";
import type { StockMediaItem } from "@/lib/social/stockMediaApi";

/** Same hero URL logic as the WordPress live preview panel. */
export function resolveWordPressFeaturedImageUrl(
  recommended: readonly StockMediaItem[],
  attachedMedia: readonly ComposerAttachedMedia[],
): string {
  const fromRecommended =
    recommended[0]?.full_url?.trim() ||
    recommended[0]?.preview_url?.trim() ||
    "";
  if (fromRecommended) {
    return fromRecommended;
  }
  const fromAttached = attachedMedia.find(
    (item) => item.mediaType === "image" && item.publicUrl.trim().length > 0,
  );
  return fromAttached?.publicUrl.trim() ?? "";
}

export function buildWordPressComposerFields(input: {
  readonly title: string;
  readonly slug: string;
  readonly content: string;
  readonly excerpt: string;
  readonly categories: readonly number[];
  readonly tags: readonly number[];
  readonly suggestedCategoryNames?: readonly string[];
  readonly suggestedTagNames?: readonly string[];
  readonly recommendedImages: readonly StockMediaItem[];
  readonly attachedMedia: readonly ComposerAttachedMedia[];
  readonly featuredMediaId?: string | null;
}): {
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  categories: number[];
  tags: number[];
  suggestedCategoryNames: string[];
  suggestedTagNames: string[];
  featuredImageUrl: string;
  featuredMediaId?: string | null;
} {
  return {
    title: input.title,
    slug: input.slug,
    content: input.content,
    excerpt: input.excerpt,
    categories: [...input.categories],
    tags: [...input.tags],
    suggestedCategoryNames: [...(input.suggestedCategoryNames ?? [])],
    suggestedTagNames: [...(input.suggestedTagNames ?? [])],
    featuredImageUrl: resolveWordPressFeaturedImageUrl(
      input.recommendedImages,
      input.attachedMedia,
    ),
    featuredMediaId: input.featuredMediaId ?? null,
  };
}
