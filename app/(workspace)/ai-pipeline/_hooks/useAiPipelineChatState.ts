"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import type { ComposerAttachedMedia } from "@/lib/post-composer/composerAttachedMediaTypes";
import { getStoredAccessToken, getStoredActiveWorkspaceId } from "@/lib/auth/session";

import { useActiveWorkspaceId } from "../../_hooks/useActiveWorkspaceId";
import {
  deleteAllUserAgentChats,
  listUserAgentChats,
  postWebsiteAgentChat,
} from "@/lib/userAgentChat/userAgentChatApi";

import type { PipelineChatMessage } from "../_types/aiPipeline";
import { buildWebsiteAgentAssistantMarkdown } from "../_utils/appendAgentStructuredMediaToMarkdown";
import { buildWebsiteAgentChatRequestBody } from "../_utils/buildWebsiteAgentChatRequestBody";
import { mapUserAgentChatsToPipelineMessages } from "../_utils/mapUserAgentChatsToPipelineMessages";

/** API rows (turns) per page — maps to multiple chat bubbles per row. */
export const AI_PIPELINE_HISTORY_PAGE_SIZE = 10;

export interface AiPipelineChatState {
  messages: PipelineChatMessage[];
  loading: boolean;
  sending: boolean;
  clearing: boolean;
  loadingMore: boolean;
  hasMoreOlder: boolean;
  error: string | null;
  draft: string;
  setDraft: (v: string) => void;
  send: (textOverride?: string) => Promise<void>;
  reload: () => Promise<void>;
  loadMoreOlder: () => Promise<void>;
  clearAllChats: () => Promise<void>;
  archiveTotal: number;
  pendingAttachment: ComposerAttachedMedia | null;
  setPendingAttachment: (v: ComposerAttachedMedia | null) => void;
}

function userMessageBody(trimmedText: string, attach: ComposerAttachedMedia | null): string {
  if (trimmedText.length > 0) {
    return trimmedText;
  }
  if (attach) {
    return "";
  }
  return "";
}

export function useAiPipelineChatState(): AiPipelineChatState {
  const activeWorkspaceId = useActiveWorkspaceId();
  const [messages, setMessages] = useState<PipelineChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [clearing, setClearing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const [archiveTotal, setArchiveTotal] = useState(0);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMoreOlder, setHasMoreOlder] = useState(false);
  const [pendingAttachment, setPendingAttachment] = useState<ComposerAttachedMedia | null>(
    null,
  );
  const nextArchiveOffsetRef = useRef(0);
  const archiveTotalRef = useRef(0);

  const loadHistory = useCallback(async (): Promise<void> => {
    const token = getStoredAccessToken();
    const ws = getStoredActiveWorkspaceId();
    if (!token?.trim() || !ws?.trim()) {
      setLoading(false);
      setError("Select a workspace to load chat history.");
      setMessages([]);
      setArchiveTotal(0);
      archiveTotalRef.current = 0;
      setHasMoreOlder(false);
      nextArchiveOffsetRef.current = 0;
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const data = await listUserAgentChats(token, ws, {
        limit: AI_PIPELINE_HISTORY_PAGE_SIZE,
        offset: 0,
      });
      setArchiveTotal(data.total);
      archiveTotalRef.current = data.total;
      setMessages(mapUserAgentChatsToPipelineMessages(data.items));
      const fetched = data.items.length;
      nextArchiveOffsetRef.current = fetched;
      setHasMoreOlder(data.total > fetched);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load history");
      setMessages([]);
      setArchiveTotal(0);
      archiveTotalRef.current = 0;
      setHasMoreOlder(false);
      nextArchiveOffsetRef.current = 0;
    } finally {
      setLoading(false);
    }
  }, []);

  const loadMoreOlder = useCallback(async (): Promise<void> => {
    if (loadingMore) {
      return;
    }
    setLoadingMore(true);
    setError(null);
    try {
      const offset = nextArchiveOffsetRef.current;
      if (offset >= archiveTotalRef.current) {
        setHasMoreOlder(false);
        return;
      }
      const token = getStoredAccessToken();
      const ws = getStoredActiveWorkspaceId();
      if (!token?.trim() || !ws?.trim()) {
        return;
      }
      const data = await listUserAgentChats(token, ws, {
        limit: AI_PIPELINE_HISTORY_PAGE_SIZE,
        offset,
      });
      if (data.items.length === 0) {
        setHasMoreOlder(false);
        return;
      }
      archiveTotalRef.current = data.total;
      setArchiveTotal(data.total);
      const older = mapUserAgentChatsToPipelineMessages(data.items);
      setMessages((prev) => [...older, ...prev]);
      nextArchiveOffsetRef.current = offset + data.items.length;
      setHasMoreOlder(data.total > nextArchiveOffsetRef.current);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load older messages");
    } finally {
      setLoadingMore(false);
    }
  }, [loadingMore]);

  useEffect(() => {
    void loadHistory();
  }, [loadHistory, activeWorkspaceId]);

  const clearAllChats = useCallback(async (): Promise<void> => {
    const token = getStoredAccessToken();
    const ws = getStoredActiveWorkspaceId();
    if (!token?.trim() || !ws?.trim()) {
      setError("Select a workspace.");
      return;
    }
    setClearing(true);
    setError(null);
    try {
      await deleteAllUserAgentChats(token, ws);
      setMessages([]);
      setArchiveTotal(0);
      archiveTotalRef.current = 0;
      setHasMoreOlder(false);
      nextArchiveOffsetRef.current = 0;
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to start new chat");
    } finally {
      setClearing(false);
    }
  }, []);

  const send = useCallback(async (textOverride?: string): Promise<void> => {
    const useOverride = textOverride !== undefined;
    const text = (useOverride ? textOverride : draft).trim();
    const attach = useOverride ? null : pendingAttachment;
    if ((!text && !attach) || sending || clearing) {
      return;
    }
    const token = getStoredAccessToken();
    const ws = getStoredActiveWorkspaceId();
    if (!token?.trim() || !ws?.trim()) {
      setError("Select a workspace.");
      return;
    }
    const previousDraft = draft;
    const previousAttachment = pendingAttachment;
    setSending(true);
    setError(null);
    const userId = `user-${Date.now()}`;
    const body = userMessageBody(text, attach);
    const attachmentPreview =
      attach !== null
        ? { publicUrl: attach.publicUrl, mediaType: attach.mediaType }
        : undefined;
    const pendingAiId = `pending-ai-${userId}`;
    setMessages((prev) => [
      ...prev,
      {
        id: userId,
        role: "user",
        body,
        meta: "You • Sent",
        channel: "website",
        attachment: attachmentPreview,
      },
      {
        id: pendingAiId,
        role: "ai",
        body: "",
        meta: "Assistant • Working…",
        channel: "website",
        agentRunning: true,
      },
    ]);
    setDraft("");
    setPendingAttachment(null);
    try {
      const res = await postWebsiteAgentChat(
        token,
        ws,
        buildWebsiteAgentChatRequestBody(text, attach),
      );
      const replyText =
        typeof res.parsed?.response === "string"
          ? res.parsed.response.trim()
          : "";
      const replyBody = buildWebsiteAgentAssistantMarkdown(replyText, res.parsed);
      setMessages((prev) => {
        const withoutPending = prev.filter((m) => m.id !== pendingAiId);
        const withUser = withoutPending.map((m) =>
          m.id === userId ? { ...m, meta: "You • Just now" } : m,
        );
        return [
          ...withUser,
          {
            id: `ai-${Date.now()}`,
            role: "ai",
            body:
              replyBody.length > 0 ? replyBody : "(No text in response)",
            meta: "Assistant • Just now",
            channel: "website",
          },
        ];
      });
    } catch (e) {
      setMessages((prev) =>
        prev.filter((m) => m.id !== userId && m.id !== pendingAiId),
      );
      setDraft(previousDraft);
      setPendingAttachment(previousAttachment);
      setError(e instanceof Error ? e.message : "Send failed");
    } finally {
      setSending(false);
    }
  }, [draft, pendingAttachment, sending, clearing]);

  return {
    messages,
    loading,
    sending,
    clearing,
    loadingMore,
    hasMoreOlder,
    error,
    draft,
    setDraft,
    send,
    reload: loadHistory,
    loadMoreOlder,
    clearAllChats,
    archiveTotal,
    pendingAttachment,
    setPendingAttachment,
  };
}
