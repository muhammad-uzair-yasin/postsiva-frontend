import type { WebsiteAgentChatRequestBody } from "@/lib/userAgentChat/userAgentChatApi";
import type { ComposerAttachedMedia } from "@/lib/post-composer/composerAttachedMediaTypes";

/**
 * Builds JSON body for POST /workspace-agent/website/chat.
 * Backend requires at least one of: text, URLs, or media UUIDs.
 */
export function buildWebsiteAgentChatRequestBody(
  text: string,
  attachment: ComposerAttachedMedia | null,
): WebsiteAgentChatRequestBody {
  const t = text.trim();
  const body: WebsiteAgentChatRequestBody = {
    text: t.length > 0 ? t : "",
  };
  if (attachment) {
    if (attachment.mediaType === "image") {
      body.image_url = attachment.publicUrl;
      body.image_media_id = attachment.mediaId;
    } else {
      body.video_url = attachment.publicUrl;
      body.video_media_id = attachment.mediaId;
    }
  }
  return body;
}
