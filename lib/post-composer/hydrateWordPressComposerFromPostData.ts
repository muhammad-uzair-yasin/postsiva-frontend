import type { ComposerAttachedMedia } from "./composerAttachedMediaTypes";
import {
  emptyComposerSessionCacheSnapshot,
  type ComposerSessionCacheSnapshot,
} from "./composerSessionCache";
import { parseWordPressFromScheduledPostData } from "./parseWordPressScheduledPostData";
import { wordpressPlainTextFromHtml } from "./wordpressPlainTextFromHtml";
import type { UnifiedDraftResponseJson } from "@/lib/social/unifiedDraftsApi";

export interface WordPressComposerHydratedState {
  readonly connectionAccountId: string;
  readonly title: string;
  readonly slug: string;
  readonly content: string;
  readonly excerpt: string;
  readonly categories: number[];
  readonly tags: number[];
  readonly suggestedCategoryNames: string[];
  readonly suggestedTagNames: string[];
  readonly media: ComposerAttachedMedia[];
  readonly featuredMediaId: string | null;
}

function asMedia(
  mediaId: string | null | undefined,
  publicUrl: string | null | undefined,
  mediaType: "image" | "video",
  filename: string,
): ComposerAttachedMedia | null {
  const id = mediaId?.trim() ?? "";
  const url = publicUrl?.trim() ?? "";
  if (!id && !url) {
    return null;
  }
  return {
    mediaId: id,
    publicUrl: url,
    mediaType,
    filename,
  };
}

function mediaFromDraftOrPostData(input: {
  readonly default_image_id?: string | null;
  readonly default_image_url?: string | null;
  readonly image_ids?: readonly string[] | null;
  readonly image_urls?: readonly string[] | null;
  readonly video_id?: string | null;
  readonly video_url?: string | null;
  readonly featured_media_id?: string | null;
  readonly featured_image_url?: string | null;
}): ComposerAttachedMedia[] {
  const out: ComposerAttachedMedia[] = [];

  const video = asMedia(
    input.video_id,
    input.video_url,
    "video",
    "wordpress-video",
  );
  if (video) {
    out.push(video);
  }

  const imageIds = input.image_ids ?? [];
  const imageUrls = input.image_urls ?? [];
  if (imageIds.length >= 2 || imageUrls.length >= 2) {
    const count = Math.max(imageIds.length, imageUrls.length);
    for (let i = 0; i < count; i += 1) {
      const img = asMedia(
        imageIds[i] ?? null,
        imageUrls[i] ?? null,
        "image",
        `wordpress-image-${i + 1}`,
      );
      if (img) {
        out.push(img);
      }
    }
    return out;
  }

  const defaultImg = asMedia(
    input.default_image_id,
    input.default_image_url,
    "image",
    "wordpress-image",
  );
  if (defaultImg) {
    out.push(defaultImg);
    return out;
  }

  const featured = asMedia(
    input.featured_media_id,
    input.featured_image_url,
    "image",
    "wordpress-featured",
  );
  if (featured) {
    out.push(featured);
  }

  return out;
}

export function wordpressHeaderAccountId(connectionId: string): string {
  const trimmed = connectionId.trim();
  return trimmed.startsWith("wordpress:") ? trimmed : `wordpress:${trimmed}`;
}

export function hydrateWordPressComposerFromDraft(
  draft: UnifiedDraftResponseJson,
): WordPressComposerHydratedState {
  const wp = draft.wordpress ?? {};
  const connectionId = draft.platform_user_id?.trim() ?? wp.connection_id?.trim() ?? "";
  return {
    connectionAccountId: wordpressHeaderAccountId(connectionId),
    title: wp.wordpress_title?.trim() ?? "",
    slug: wp.wordpress_slug?.trim() ?? "",
    content: wp.wordpress_content?.trim() ?? draft.default_text?.trim() ?? "",
    excerpt: wp.wordpress_excerpt?.trim() ?? "",
    categories: [...(wp.categories ?? [])],
    tags: [...(wp.tags ?? [])],
    suggestedCategoryNames: [...(wp.suggested_category_names ?? [])],
    suggestedTagNames: [...(wp.suggested_tag_names ?? [])],
    featuredMediaId: wp.featured_media_id?.trim() ?? null,
    media: mediaFromDraftOrPostData({
      default_image_id: draft.default_image_id,
      default_image_url: draft.default_image_url,
      image_ids: draft.image_ids,
      image_urls: draft.image_urls,
      video_id: draft.video_id,
      video_url: draft.video_url,
      featured_media_id: wp.featured_media_id,
      featured_image_url: wp.featured_image_url,
    }),
  };
}

export function hydrateWordPressComposerFromScheduled(input: {
  readonly platform_user_id: string;
  readonly post_data: Record<string, unknown>;
}): WordPressComposerHydratedState {
  const pd = input.post_data;
  const wp = parseWordPressFromScheduledPostData(pd);
  const connectionId =
    input.platform_user_id?.trim() ?? wp?.connection_id?.trim() ?? "";
  const defaultImageId =
    typeof pd.default_image_id === "string" ? pd.default_image_id : null;
  const defaultImageUrl =
    typeof pd.default_image_url === "string" ? pd.default_image_url : null;
  const videoId = typeof pd.video_id === "string" ? pd.video_id : null;
  const videoUrl = typeof pd.video_url === "string" ? pd.video_url : null;
  const imageIds = Array.isArray(pd.image_ids)
    ? pd.image_ids.filter((x): x is string => typeof x === "string")
    : [];
  const imageUrls = Array.isArray(pd.image_urls)
    ? pd.image_urls.filter((x): x is string => typeof x === "string")
    : [];

  return {
    connectionAccountId: wordpressHeaderAccountId(connectionId),
    title: wp?.wordpress_title?.trim() ?? "",
    slug: wp?.wordpress_slug?.trim() ?? "",
    content:
      wp?.wordpress_content?.trim() ??
      (typeof pd.default_text === "string" ? pd.default_text.trim() : ""),
    excerpt: wp?.wordpress_excerpt?.trim() ?? "",
    categories: [...(wp?.categories ?? [])],
    tags: [...(wp?.tags ?? [])],
    suggestedCategoryNames: [...(wp?.suggested_category_names ?? [])],
    suggestedTagNames: [...(wp?.suggested_tag_names ?? [])],
    featuredMediaId: wp?.featured_media_id?.trim() ?? null,
    media: mediaFromDraftOrPostData({
      default_image_id: defaultImageId,
      default_image_url: defaultImageUrl,
      image_ids: imageIds,
      image_urls: imageUrls,
      video_id: videoId,
      video_url: videoUrl,
      featured_media_id: wp?.featured_media_id,
      featured_image_url: wp?.featured_image_url,
    }),
  };
}

/** Composer session snapshot for edit/preview — replaces stale session cache. */
export function composerSessionSnapshotFromWordPressHydrated(
  state: WordPressComposerHydratedState,
): ComposerSessionCacheSnapshot {
  const empty = emptyComposerSessionCacheSnapshot();
  const plainBody =
    wordpressPlainTextFromHtml(state.content) ||
    state.excerpt.trim() ||
    state.title.trim();
  return {
    ...empty,
    unifiedBody: plainBody,
    unifiedMedia: [...state.media],
    wordpressTitle: state.title,
    wordpressSlug: state.slug,
    wordpressContent: state.content,
    wordpressExcerpt: state.excerpt,
    wordpressCategories: [...state.categories],
    wordpressTags: [...state.tags],
    wordpressSuggestedCategoryNames: [...state.suggestedCategoryNames],
    wordpressSuggestedTagNames: [...state.suggestedTagNames],
    selectedIds: [state.connectionAccountId],
    livePreviewEnabled: true,
  };
}
