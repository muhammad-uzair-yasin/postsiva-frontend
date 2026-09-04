/** WordPress fields stored on scheduled_posts.post_data (mirrors draft wordpress block). */
export interface WordPressScheduledFields {
  readonly wordpress_title?: string;
  readonly wordpress_content?: string;
  readonly wordpress_excerpt?: string;
  readonly wordpress_slug?: string;
  readonly categories?: readonly number[];
  readonly tags?: readonly number[];
  readonly suggested_category_names?: readonly string[];
  readonly suggested_tag_names?: readonly string[];
  readonly featured_media_id?: string;
  readonly featured_image_url?: string;
  readonly connection_id?: string;
  readonly media_placement?: string;
}

function asRecord(value: unknown): Record<string, unknown> | null {
  if (value !== null && typeof value === "object" && !Array.isArray(value)) {
    return value as Record<string, unknown>;
  }
  return null;
}

function asNumberArray(value: unknown): number[] | undefined {
  if (!Array.isArray(value)) {
    return undefined;
  }
  const out = value.filter((x): x is number => typeof x === "number");
  return out.length > 0 ? out : undefined;
}

function asStringArray(value: unknown): string[] | undefined {
  if (!Array.isArray(value)) {
    return undefined;
  }
  const out = value
    .filter((x): x is string => typeof x === "string")
    .map((x) => x.trim())
    .filter(Boolean);
  return out.length > 0 ? out : undefined;
}

/** Parse WordPress article fields from scheduled post_data (wordpress block or legacy payload). */
export function parseWordPressFromScheduledPostData(
  postData: Record<string, unknown> | null | undefined,
): WordPressScheduledFields | null {
  if (!postData) {
    return null;
  }

  const wpBlock = asRecord(postData.wordpress);
  if (wpBlock) {
    return {
      wordpress_title:
        typeof wpBlock.wordpress_title === "string"
          ? wpBlock.wordpress_title
          : undefined,
      wordpress_content:
        typeof wpBlock.wordpress_content === "string"
          ? wpBlock.wordpress_content
          : undefined,
      wordpress_excerpt:
        typeof wpBlock.wordpress_excerpt === "string"
          ? wpBlock.wordpress_excerpt
          : undefined,
      wordpress_slug:
        typeof wpBlock.wordpress_slug === "string"
          ? wpBlock.wordpress_slug
          : undefined,
      categories: asNumberArray(wpBlock.categories),
      tags: asNumberArray(wpBlock.tags),
      suggested_category_names: asStringArray(wpBlock.suggested_category_names),
      suggested_tag_names: asStringArray(wpBlock.suggested_tag_names),
      featured_media_id:
        typeof wpBlock.featured_media_id === "string"
          ? wpBlock.featured_media_id
          : undefined,
      featured_image_url:
        typeof wpBlock.featured_image_url === "string"
          ? wpBlock.featured_image_url
          : typeof postData.featured_image_url === "string"
            ? postData.featured_image_url
            : undefined,
      connection_id:
        typeof wpBlock.connection_id === "string"
          ? wpBlock.connection_id
          : typeof postData.connection_id === "string"
            ? postData.connection_id
            : undefined,
      media_placement:
        typeof wpBlock.media_placement === "string"
          ? wpBlock.media_placement
          : typeof postData.media_placement === "string"
            ? postData.media_placement
            : undefined,
    };
  }

  const payload = asRecord(postData.wordpress_payload);
  if (!payload) {
    return null;
  }

  return {
    wordpress_title: typeof payload.title === "string" ? payload.title : undefined,
    wordpress_content:
      typeof payload.content === "string" ? payload.content : undefined,
    wordpress_excerpt:
      typeof payload.excerpt === "string" ? payload.excerpt : undefined,
    wordpress_slug: typeof payload.slug === "string" ? payload.slug : undefined,
    categories: asNumberArray(payload.categories),
    tags: asNumberArray(payload.tags),
    featured_image_url:
      typeof postData.featured_image_url === "string"
        ? postData.featured_image_url
        : undefined,
    featured_media_id:
      typeof postData.featured_media_id === "string"
        ? postData.featured_media_id
        : undefined,
    connection_id:
      typeof postData.connection_id === "string"
        ? postData.connection_id
        : undefined,
    media_placement:
      typeof postData.media_placement === "string"
        ? postData.media_placement
        : undefined,
  };
}

export function wordpressScheduledCaption(
  postData: Record<string, unknown>,
): string {
  const wp = parseWordPressFromScheduledPostData(postData);
  const excerpt = wp?.wordpress_excerpt?.trim();
  if (excerpt) {
    return excerpt;
  }
  const raw = postData.default_text;
  return typeof raw === "string" ? raw.trim() : "";
}

export function wordpressScheduledCardTitle(
  postData: Record<string, unknown>,
): string {
  const wp = parseWordPressFromScheduledPostData(postData);
  const title = wp?.wordpress_title?.trim();
  if (title) {
    return title.slice(0, 120);
  }
  const caption = wordpressScheduledCaption(postData);
  return caption.slice(0, 120) || "Scheduled post";
}

export function wordpressScheduledPreviewText(
  postData: Record<string, unknown>,
): string {
  const wp = parseWordPressFromScheduledPostData(postData);
  const excerpt = wp?.wordpress_excerpt?.trim();
  if (excerpt) {
    return excerpt;
  }
  const content = wp?.wordpress_content?.trim();
  if (content) {
    return content
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, 280);
  }
  return wordpressScheduledCaption(postData);
}

export function wordpressScheduledFeaturedImageUrl(
  postData: Record<string, unknown>,
): string | null {
  const wp = parseWordPressFromScheduledPostData(postData);
  const url = wp?.featured_image_url?.trim();
  if (url && /^https?:\/\//i.test(url)) {
    return url;
  }
  const fallback = postData.default_image_url;
  if (typeof fallback === "string" && /^https?:\/\//i.test(fallback.trim())) {
    return fallback.trim();
  }
  return null;
}
