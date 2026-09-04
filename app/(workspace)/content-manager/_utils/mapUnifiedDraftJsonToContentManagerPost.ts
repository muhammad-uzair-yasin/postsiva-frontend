import type { UnifiedDraftResponseJson } from "@/lib/social/unifiedDraftsApi";

import type {
  ContentManagerChannel,
  ContentManagerPost,
} from "../_types/contentManagerTypes";

const CHANNELS: ReadonlySet<string> = new Set([
  "instagram",
  "linkedin",
  "facebook",
  "threads",
  "tiktok",
  "youtube",
  "pinterest",
  "bluesky",
  "mastodon",
  "wordpress",
  "x",
]);

function stripHtml(text: string): string {
  return text
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function wordpressDraftPreviewText(d: UnifiedDraftResponseJson): string {
  const wp = d.wordpress;
  const excerpt =
    typeof wp?.wordpress_excerpt === "string" ? wp.wordpress_excerpt.trim() : "";
  if (excerpt) {
    return excerpt;
  }
  const content =
    typeof wp?.wordpress_content === "string" ? wp.wordpress_content.trim() : "";
  if (content) {
    return stripHtml(content).slice(0, 500);
  }
  return typeof d.default_text === "string" ? d.default_text.trim() : "";
}

function wordpressDraftTitle(d: UnifiedDraftResponseJson, body: string): string {
  const wpTitle =
    typeof d.wordpress?.wordpress_title === "string"
      ? d.wordpress.wordpress_title.trim()
      : "";
  if (wpTitle) {
    return wpTitle.slice(0, 120);
  }
  return firstLine(body);
}

function firstHttpUrl(values: readonly unknown[]): string | null {
  for (const v of values) {
    if (typeof v === "string") {
      const t = v.trim();
      if (/^https?:\/\//i.test(t)) {
        return t;
      }
    }
  }
  return null;
}

function firstLine(text: string): string {
  const raw = text.replace(/\r\n/g, "\n").trim();
  if (!raw) {
    return "Draft";
  }
  const line = raw.split("\n").map((l) => l.trim()).filter(Boolean)[0];
  return (line ?? raw).slice(0, 120);
}

export function mapUnifiedDraftJsonToContentManagerPost(
  d: UnifiedDraftResponseJson,
): ContentManagerPost {
  const plat = d.platform?.toLowerCase() ?? "";
  const channel: ContentManagerChannel = (() => {
    if (plat === "twitter") {
      return "x";
    }
    if (CHANNELS.has(plat)) {
      return plat as ContentManagerChannel;
    }
    return "instagram";
  })();

  const body =
    plat === "wordpress"
      ? wordpressDraftPreviewText(d)
      : typeof d.default_text === "string"
        ? d.default_text.trim()
        : "";
  const imageUrl =
    firstHttpUrl([
      d.default_image_url,
      d.wordpress?.featured_image_url,
    ]) ??
    firstHttpUrl(Array.isArray(d.image_urls) ? d.image_urls : []);
  const videoUrl = firstHttpUrl([d.video_url]);

  let draftMedia: ContentManagerPost["draftMedia"] = "empty";
  if (videoUrl) {
    draftMedia = "video";
  } else if (imageUrl) {
    draftMedia = "image";
  }

  return {
    id: d.id,
    sourceDraftId: d.id,
    draftPayload: d,
    status: "draft",
    channel,
    handle: plat === "wordpress" ? "" : (d.platform_user_id ?? ""),
    body: body || "—",
    title: plat === "wordpress" ? wordpressDraftTitle(d, body) : firstLine(body),
    imageUrl: imageUrl ?? undefined,
    videoUrl: videoUrl ?? undefined,
    draftMedia,
  };
}
