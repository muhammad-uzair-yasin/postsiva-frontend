import type { UnifiedDraftResponseJson } from "@/lib/social/unifiedDraftsApi";
import type { UnifiedScheduledPostItemJson } from "@/lib/social/unifiedScheduledPostsApi";
import {
  parseWordPressFromScheduledPostData,
  wordpressScheduledCaption,
  wordpressScheduledFeaturedImageUrl,
} from "@/lib/post-composer/parseWordPressScheduledPostData";

/** Maps a scheduled row into draft-shaped JSON for shared summary/caption UI. */
export function scheduledPostToSyntheticDraft(
  item: UnifiedScheduledPostItemJson,
): UnifiedDraftResponseJson {
  const pd = item.post_data ?? {};
  const isWordPress = item.platform?.trim().toLowerCase() === "wordpress";
  const text = isWordPress
    ? wordpressScheduledCaption(pd)
    : (() => {
        const textRaw = pd.default_text ?? pd.text ?? pd.caption;
        return typeof textRaw === "string" ? textRaw : "";
      })();
  const wp = isWordPress ? parseWordPressFromScheduledPostData(pd) : null;
  const featuredUrl = isWordPress
    ? wordpressScheduledFeaturedImageUrl(pd)
    : typeof pd.default_image_url === "string"
      ? pd.default_image_url
      : null;

  return {
    id: item.scheduled_post_id,
    platform: item.platform,
    platform_user_id: item.platform_user_id,
    post_type: item.post_type,
    status: item.status,
    default_text: text,
    default_image_id:
      typeof pd.default_image_id === "string" ? pd.default_image_id : null,
    default_image_url: featuredUrl,
    image_ids: Array.isArray(pd.image_ids) ? (pd.image_ids as string[]) : null,
    image_urls: Array.isArray(pd.image_urls) ? (pd.image_urls as string[]) : null,
    video_id: typeof pd.video_id === "string" ? pd.video_id : null,
    video_url: typeof pd.video_url === "string" ? pd.video_url : null,
    wordpress: wp
      ? {
          wordpress_title: wp.wordpress_title ?? null,
          wordpress_content: wp.wordpress_content ?? null,
          wordpress_excerpt: wp.wordpress_excerpt ?? null,
          wordpress_slug: wp.wordpress_slug ?? null,
          categories: wp.categories ? [...wp.categories] : null,
          tags: wp.tags ? [...wp.tags] : null,
          suggested_category_names: wp.suggested_category_names
            ? [...wp.suggested_category_names]
            : null,
          suggested_tag_names: wp.suggested_tag_names
            ? [...wp.suggested_tag_names]
            : null,
          featured_media_id: wp.featured_media_id ?? null,
          featured_image_url: wp.featured_image_url ?? null,
          connection_id: wp.connection_id ?? null,
          media_placement: wp.media_placement ?? null,
        }
      : null,
  };
}
