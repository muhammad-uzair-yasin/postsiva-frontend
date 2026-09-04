"use client";

import type { ReactElement } from "react";

import { AgentThinkingIndicator } from "@/lib/ui/AgentThinkingIndicator";

/**
 * Shown while POST /workspace-agent/website/chat is in flight.
 */
export function AiPipelineAgentRunningBubble(): ReactElement {
  return (
    <div className="rounded-2xl rounded-tl-sm border border-outline-variant/15 bg-surface-container-low/90 px-4 py-3 shadow-[0_12px_40px_-16px_rgba(0,0,0,0.5)] ring-1 ring-white/[0.04] backdrop-blur-sm">
      <AgentThinkingIndicator className="text-sm text-on-surface-variant" />
    </div>
  );
}
