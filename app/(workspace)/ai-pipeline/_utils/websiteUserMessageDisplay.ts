import type { PipelineMessageAttachmentPreview } from "../_types/aiPipeline";

/**
 * Strips legacy "Text:\\n" prefix from stored inbound user text.
 */
export function cleanUserInboundText(raw: string): string {
  const t = raw.trim();
  if (t.toLowerCase().startsWith("text:")) {
    return t.replace(/^text:\s*/i, "").trim();
  }
  return t;
}

/**
 * Parses website archived `user.text` (from `build_website_agent_user_text`) into a caption plus
 * optional image/video preview URL so the UI can hide agent scaffolding and show only media + caption.
 */
export function parseWebsiteUserMessageForDisplay(raw: string): {
  caption: string;
  attachment?: PipelineMessageAttachmentPreview;
} {
  const full = raw.trim();
  if (full.length === 0) {
    return { caption: "" };
  }

  const imageUrlMatch = full.match(
    /Image URL \(website chat\):\s*\n?\s*(https?:\/\/\S+)/i,
  );
  const videoUrlMatch = full.match(
    /Video URL \(website chat\):\s*\n?\s*(https?:\/\/\S+)/i,
  );

  let attachment: PipelineMessageAttachmentPreview | undefined;
  if (imageUrlMatch?.[1]) {
    attachment = { publicUrl: imageUrlMatch[1], mediaType: "image" };
  } else if (videoUrlMatch?.[1]) {
    attachment = { publicUrl: videoUrlMatch[1], mediaType: "video" };
  }

  const hasWebsiteScaffold =
    full.includes("[Website chat: media attached") ||
    full.includes("Image URL (website chat):") ||
    full.includes("Video URL (website chat):");

  const textMatch = full.match(
    /^Text:\s*\n?([\s\S]*?)(?=\n\n(?:Image URL|Video URL|Image media|Video media)|$)/i,
  );
  let caption = (textMatch?.[1] ?? "").trim();

  if (!hasWebsiteScaffold && !attachment) {
    return { caption: cleanUserInboundText(full) };
  }

  if (attachment && !caption) {
    return { caption: "", attachment };
  }

  if (caption && attachment) {
    return { caption, attachment };
  }

  if (caption && !attachment) {
    return { caption };
  }

  if (!attachment) {
    return { caption: cleanUserInboundText(full) };
  }

  return { caption: "", attachment };
}

/** Channel prefixes before Postsiva media blocks (Instagram DM, Messenger, …). */
const POSTSIVA_MEDIA_SCAFFOLD =
  /Postsiva media|\[Instagram DM:|\[Facebook Messenger:/i;

/**
 * Parses archived user text that includes `Postsiva media` blocks with
 * `image_id` / `image_url` / `caption` (or `video_*`) — same shape as WhatsApp/Instagram backend.
 * Returns a short caption plus optional attachment so the UI shows media + text, not agent scaffolding.
 */
export function parsePostsivaMediaUserMessageForDisplay(raw: string): {
  caption: string;
  attachment?: PipelineMessageAttachmentPreview;
} {
  const full = raw.trim();
  if (full.length === 0) {
    return { caption: "" };
  }

  if (!POSTSIVA_MEDIA_SCAFFOLD.test(full)) {
    return { caption: cleanUserInboundText(full) };
  }

  const imageUrlMatch = full.match(/image_url:\s*(https?:\/\/\S+)/i);
  const videoUrlMatch = full.match(/video_url:\s*(https?:\/\/\S+)/i);

  let attachment: PipelineMessageAttachmentPreview | undefined;
  let mediaKind: "image" | "video" = "image";
  if (imageUrlMatch?.[1]) {
    attachment = { publicUrl: imageUrlMatch[1], mediaType: "image" };
    mediaKind = "image";
  } else if (videoUrlMatch?.[1]) {
    attachment = { publicUrl: videoUrlMatch[1], mediaType: "video" };
    mediaKind = "video";
  }

  if (!attachment) {
    return { caption: cleanUserInboundText(full) };
  }

  const textBlockMatch = full.match(
    /Text:\s*\n?([\s\S]*?)(?=\n\nPostsiva media|\nPostsiva media|$)/i,
  );
  const textPart = (textBlockMatch?.[1] ?? "").trim();

  const urlKey = mediaKind === "image" ? "image_url" : "video_url";
  const urlVal = attachment.publicUrl.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const urlLine = new RegExp(`${urlKey}:\\s*${urlVal}`, "i");
  const urlLineMatch = full.match(urlLine);
  let mediaCaption = "";
  if (urlLineMatch && urlLineMatch.index !== undefined) {
    const afterUrl = full.slice(urlLineMatch.index + urlLineMatch[0].length);
    const cap = afterUrl.match(
      /^\s*caption:\s*([\s\S]*?)(?=\s+(?:image_id|video_id|image_url|video_url):|\n\n---|\s*$)/i,
    );
    mediaCaption = (cap?.[1] ?? "").trim();
  }

  const caption =
    textPart.length > 0 ? textPart : mediaCaption.length > 0 ? mediaCaption : "";

  return { caption, attachment };
}
