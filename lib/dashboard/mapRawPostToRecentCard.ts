import type { DashboardRecentPostView } from "./dashboardRecentPostTypes";
import { formatRelativePublishedLabel } from "./formatRelativePublishedLabel";
import { formatStatCount } from "./profileCard/formatStatCount";

const DEFAULT_CARD_LIMIT = 4;

function isRecord(v: unknown): v is Record<string, unknown> {
  return v !== null && typeof v === "object";
}

function pickImageUrl(post: Record<string, unknown>): string | null {
  const videos = post.videos;
  if (isRecord(videos) && typeof videos.thumbnailUrl === "string") {
    const u = videos.thumbnailUrl.trim();
    return u.length > 0 ? u : null;
  }
  const images = post.images;
  if (Array.isArray(images) && images.length > 0) {
    const first = images[0];
    if (isRecord(first) && typeof first.url === "string") {
      const u = first.url.trim();
      return u.length > 0 ? u : null;
    }
  }
  return null;
}

function trimCaption(raw: string, maxChars: number): string {
  const t = raw.replace(/\s+/g, " ").trim();
  if (t.length <= maxChars) {
    return t;
  }
  return `${t.slice(0, Math.max(0, maxChars - 1)).trim()}…`;
}

/** Maps unified post `type` to a small badge label (not “Reel”). */
function mediaTypeBadgeFromUnifiedType(typeLower: string): string | null {
  switch (typeLower) {
    case "video":
      return "Video";
    case "image":
      return "Image";
    case "carousel":
      return "Multi";
    case "text":
      return "Text";
    default:
      return null;
  }
}

/** Maps one `UnifiedPostItem` from GET /unified/posts/ → dashboard card model. */
export function mapRawPostToRecentCard(
  raw: unknown,
  maxCaptionChars: number = 100,
): DashboardRecentPostView | null {
  if (!isRecord(raw)) {
    return null;
  }
  const postIdRaw = raw.post_id;
  const legacyId = raw.id;
  const idRaw =
    typeof postIdRaw === "string" && postIdRaw.length > 0
      ? postIdRaw
      : typeof legacyId === "string"
        ? legacyId
        : "";
  if (idRaw.length === 0) {
    return null;
  }

  const commentary =
    typeof raw.commentary === "string" ? raw.commentary.trim() : "";
  const caption =
    commentary.length > 0
      ? trimCaption(commentary, maxCaptionChars)
      : "Post";

  const typeRaw = typeof raw.type === "string" ? raw.type.toLowerCase() : "";
  const mediaTypeBadge = mediaTypeBadgeFromUnifiedType(typeRaw);

  const likeCount = typeof raw.like_count === "number" ? raw.like_count : 0;
  const commentCount =
    typeof raw.comment_count === "number" ? raw.comment_count : 0;
  const impressionCount =
    typeof raw.impression_count === "number" ? raw.impression_count : 0;

  return {
    id: idRaw,
    imageSrc: pickImageUrl(raw),
    caption,
    dateLabel: formatRelativePublishedLabel(
      typeof raw.published_at === "string" ? raw.published_at : null,
    ),
    likesLabel: formatStatCount(likeCount),
    commentsLabel: formatStatCount(commentCount),
    reachLabel: formatStatCount(impressionCount),
    mediaTypeBadge,
  };
}

/** Reads `body[platformKey].posts` from GET /unified/posts/ and maps to card rows. */
export function mapUnifiedPostsBodyToRecentCards(
  body: Record<string, unknown>,
  platformKey: string,
  limit: number = DEFAULT_CARD_LIMIT,
): DashboardRecentPostView[] {
  const slice = body[platformKey];
  if (!isRecord(slice)) {
    return [];
  }
  const posts = slice.posts;
  if (!Array.isArray(posts)) {
    return [];
  }
  const capped = posts.slice(0, limit);
  const out: DashboardRecentPostView[] = [];
  for (const item of capped) {
    const card = mapRawPostToRecentCard(item);
    if (card !== null) {
      out.push(card);
    }
  }
  return out;
}

const UNIFIED_POSTS_BODY_PLATFORM_KEYS: readonly string[] = [
  "instagram",
  "facebook",
  "linkedin",
  "youtube",
  "tiktok",
  "threads",
  "pinterest",
  "bluesky",
  "mastodon",
  "wordpress",
];

function publishedAtSortKey(raw: unknown): number {
  if (!isRecord(raw)) {
    return 0;
  }
  const iso = raw.published_at;
  if (typeof iso !== "string") {
    return 0;
  }
  const t = Date.parse(iso);
  return Number.isNaN(t) ? 0 : t;
}

/**
 * Merges posts from every platform slice in GET /unified/posts/ (no `platforms` filter),
 * newest first, then maps to dashboard cards.
 */
export function mapUnifiedPostsBodyToRecentCardsAllPlatforms(
  body: Record<string, unknown>,
  limit: number = DEFAULT_CARD_LIMIT,
): DashboardRecentPostView[] {
  const collected: { readonly raw: unknown; readonly sortKey: number }[] = [];
  for (const key of UNIFIED_POSTS_BODY_PLATFORM_KEYS) {
    const slice = body[key];
    if (!isRecord(slice)) {
      continue;
    }
    const posts = slice.posts;
    if (!Array.isArray(posts)) {
      continue;
    }
    for (const p of posts) {
      collected.push({ raw: p, sortKey: publishedAtSortKey(p) });
    }
  }
  collected.sort((a, b) => b.sortKey - a.sortKey);
  const out: DashboardRecentPostView[] = [];
  for (const { raw } of collected) {
    const card = mapRawPostToRecentCard(raw);
    if (card !== null) {
      out.push(card);
    }
    if (out.length >= limit) {
      break;
    }
  }
  return out;
}
