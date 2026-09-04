export type PipelineChatRole = "ai" | "user";

/** Optimistic / display-only preview for a sent attachment (website channel). */
export interface PipelineMessageAttachmentPreview {
  publicUrl: string;
  mediaType: "image" | "video" | "document";
}

export interface PipelineChatMessage {
  id: string;
  role: PipelineChatRole;
  body: string;
  meta: string;
  /** Stored `turn_json.channel` (e.g. website, whatsapp). */
  channel?: string;
  attachment?: PipelineMessageAttachmentPreview;
  showPipelineSync?: boolean;
  /** Optimistic row while POST /workspace-agent/website/chat is in flight. */
  agentRunning?: boolean;
}
