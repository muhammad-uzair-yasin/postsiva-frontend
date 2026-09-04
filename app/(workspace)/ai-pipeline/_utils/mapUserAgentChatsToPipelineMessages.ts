import type { UserAgentChatItem } from "@/lib/userAgentChat/userAgentChatApi";
import type { PipelineChatMessage } from "../_types/aiPipeline";
import {
  buildWebsiteAgentAssistantMarkdown,
  parseAssistantRawForStructured,
} from "./appendAgentStructuredMediaToMarkdown";
import {
  parsePostsivaMediaUserMessageForDisplay,
  parseWebsiteUserMessageForDisplay,
} from "./websiteUserMessageDisplay";

function formatMeta(label: string, iso?: string): string {
  if (!iso?.trim()) {
    return label;
  }
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) {
    return `${label} • ${iso}`;
  }
  return `${label} • ${d.toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  })}`;
}

/**
 * API returns newest first; chat UI shows oldest at top.
 * Each row is one user+assistant turn.
 */
export function mapUserAgentChatsToPipelineMessages(
  items: readonly UserAgentChatItem[],
): PipelineChatMessage[] {
  const chronological = [...items].reverse();
  const out: PipelineChatMessage[] = [];
  for (const row of chronological) {
    const { turn } = row;
    const channelRaw =
      typeof turn.channel === "string" ? turn.channel.trim() : "";
    const rawUser = turn.user?.text ?? "";

    let userBody: string;
    let userAttachment: PipelineChatMessage["attachment"];

    if (channelRaw === "website") {
      const parsed = parseWebsiteUserMessageForDisplay(rawUser);
      userBody = parsed.caption;
      userAttachment = parsed.attachment;
    } else {
      const parsed = parsePostsivaMediaUserMessageForDisplay(rawUser);
      userBody = parsed.caption;
      userAttachment = parsed.attachment;
    }

    if (userBody.length > 0 || userAttachment) {
      out.push({
        id: `arch-user-${row.id}`,
        role: "user",
        body: userBody,
        meta: formatMeta("You", turn.user?.at ?? row.created_at),
        channel: channelRaw.length > 0 ? channelRaw : undefined,
        attachment: userAttachment,
      });
    }
    const aiText = (turn.assistant?.text ?? "").trim();
    const aiRaw = turn.assistant?.raw;
    const structuredFromRaw =
      typeof aiRaw === "string" ? parseAssistantRawForStructured(aiRaw) : {};
    const aiBody = buildWebsiteAgentAssistantMarkdown(aiText, structuredFromRaw);
    if (aiBody.length > 0) {
      out.push({
        id: `arch-ai-${row.id}`,
        role: "ai",
        body: aiBody,
        meta: formatMeta("Assistant", turn.assistant?.at ?? row.created_at),
        channel: channelRaw.length > 0 ? channelRaw : undefined,
      });
    }
  }
  return out;
}
