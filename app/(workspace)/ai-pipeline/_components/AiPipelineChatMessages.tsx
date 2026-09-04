"use client";

import Image from "next/image";
import type { ReactElement } from "react";

import {
  profileImageUrlFromUser,
  userAvatarInitialsFromUser,
} from "@/lib/auth/userAvatar";

import { useStoredAuthUser } from "../../_hooks/useStoredAuthUser";
import type {
  PipelineChatMessage,
  PipelineMessageAttachmentPreview,
} from "../_types/aiPipeline";
import { formatAgentChannelLabel } from "../_utils/formatAgentChannelLabel";
import { AiPipelineAgentRunningBubble } from "./AiPipelineAgentRunningBubble";
import { AiPipelineAiDeliveredMessage } from "./AiPipelineAiDeliveredMessage";
import { AiPipelineMarkdownContent } from "./AiPipelineMarkdownContent";

/** New replies from POST /workspace-agent/website/chat use `ai-${Date.now()}` ids. */
function isLiveWebsiteAgentReply(id: string): boolean {
  return /^ai-\d+$/.test(id);
}

function ChannelBadge({
  channel,
  variant = "default",
}: {
  channel: string;
  variant?: "default" | "onPrimary";
}): ReactElement {
  const label = formatAgentChannelLabel(channel);
  const cls =
    variant === "onPrimary"
      ? "border border-white/30 bg-black/20 text-white shadow-sm backdrop-blur-sm"
      : "border border-outline-variant/25 bg-surface-container-high/95 text-secondary shadow-sm backdrop-blur-sm";
  return (
    <span
      className={`inline-flex max-w-full items-center rounded-lg px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider ${cls}`}
      title={channel}
    >
      {label}
    </span>
  );
}

function UserMessageAttachmentPreview({
  attachment,
}: {
  attachment: PipelineMessageAttachmentPreview;
}): ReactElement {
  return (
    <div className="mb-2 flex justify-end">
      <div className="max-h-48 max-w-[220px] overflow-hidden rounded-xl border border-white/30 bg-black/25 shadow-lg ring-1 ring-white/10">
        {attachment.mediaType === "image" ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={attachment.publicUrl}
            alt=""
            className="max-h-48 w-full object-cover"
          />
        ) : (
          <video
            src={attachment.publicUrl}
            className="max-h-48 w-full object-cover"
            controls
            playsInline
            preload="metadata"
          />
        )}
      </div>
    </div>
  );
}

export function AiPipelineChatMessages({
  messages,
}: {
  messages: readonly PipelineChatMessage[];
}): ReactElement {
  const { user, isReady } = useStoredAuthUser();
  const profileUrl = user ? profileImageUrlFromUser(user) : null;
  const userAvatarAlt =
    user?.full_name?.trim() ||
    user?.username?.trim() ||
    user?.email?.trim() ||
    "You";
  const userAvatarInitials = user
    ? userAvatarInitialsFromUser(user)
    : isReady
      ? "?"
      : "…";

  return (
    <div className="w-full min-w-0 space-y-6 overflow-x-hidden">
      {messages.map((msg) =>
        msg.role === "ai" ? (
          <div
            key={msg.id}
            className="flex w-full max-w-full min-w-0 justify-start gap-3 sm:gap-4"
          >
            <div
              className="relative flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-secondary/30 bg-surface-container-high p-0.5 shadow-[0_10px_32px_-8px_rgba(107,73,216,0.45)] ring-1 ring-secondary/20"
              title="Piva — Your AI Companion"
            >
              {/* Same asset as WorkspaceAgentFabLauncher (`/image.png`). */}
              <Image
                src="/images/new_piva1.png"
                alt=""
                width={44}
                height={44}
                className="max-h-full max-w-full object-contain object-center drop-shadow-[0_1px_4px_rgba(0,0,0,0.45)]"
              />
            </div>
            <div className="min-w-0 flex-1 space-y-2">
              {msg.agentRunning === true ? (
                <AiPipelineAgentRunningBubble />
              ) : msg.showPipelineSync ? (
                <div className="space-y-4">
                  <div className="rounded-2xl rounded-tl-sm border border-outline-variant/15 bg-surface-container-low/90 p-5 shadow-[0_12px_40px_-16px_rgba(0,0,0,0.5)] ring-1 ring-white/[0.04] backdrop-blur-sm">
                    <AiPipelineMarkdownContent content={msg.body} />
                  </div>
                  <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-secondary">
                    <span className="relative flex h-2 w-2">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-secondary opacity-75 motion-reduce:hidden" />
                      <span className="relative inline-flex h-2 w-2 rounded-full bg-secondary" />
                    </span>
                    Syncing with Pipeline...
                  </div>
                </div>
              ) : (
                <AiPipelineAiDeliveredMessage
                  body={msg.body}
                  channel={msg.channel}
                  animate={isLiveWebsiteAgentReply(msg.id)}
                />
              )}
              <span className="block max-w-full break-words px-1 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant/55">
                {msg.meta}
              </span>
            </div>
          </div>
        ) : (
          <div
            key={msg.id}
            className="flex w-full max-w-full min-w-0 justify-end"
          >
            <div className="flex min-w-0 max-w-full flex-row-reverse items-start gap-3 sm:gap-4">
              <div
                className={`flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-2xl shadow-[0_12px_36px_-10px_rgba(107,73,216,0.65)] ring-1 ring-primary/40 ${
                  profileUrl
                    ? "border border-primary/25 bg-surface-container-high"
                    : "bg-gradient-to-br from-primary-container to-[#4f36a8] text-on-primary-container"
                }`}
                title={userAvatarAlt}
              >
                {profileUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element -- user profile URL from auth session
                  <img
                    src={profileUrl}
                    alt={userAvatarAlt}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <span className="text-xs font-bold" aria-hidden>
                    {userAvatarInitials}
                  </span>
                )}
              </div>
              <div className="flex min-w-0 max-w-[min(100%,28rem)] flex-col items-end space-y-2 text-right">
                <div className="w-fit max-w-full rounded-2xl rounded-tr-sm border border-primary/25 bg-gradient-to-br from-primary-container via-primary-container to-[#5a3ec4] p-5 text-left text-on-primary-container shadow-[0_18px_44px_-14px_rgba(107,73,216,0.55)] ring-1 ring-white/10">
                  {msg.channel ? (
                    <div className="mb-2 flex justify-end">
                      <ChannelBadge channel={msg.channel} variant="onPrimary" />
                    </div>
                  ) : null}
                  {msg.attachment ? (
                    <UserMessageAttachmentPreview attachment={msg.attachment} />
                  ) : null}
                  {msg.body.trim().length > 0 ? (
                    <p className="break-words text-sm leading-relaxed">{msg.body}</p>
                  ) : null}
                </div>
                <span className="block max-w-full break-words px-1 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant/55">
                  {msg.meta}
                </span>
              </div>
            </div>
          </div>
        ),
      )}
    </div>
  );
}
