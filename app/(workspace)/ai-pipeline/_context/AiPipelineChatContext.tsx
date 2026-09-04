"use client";

import { createContext, useContext, type ReactNode, type ReactElement } from "react";

import {
  useAiPipelineChatState,
  type AiPipelineChatState,
} from "../_hooks/useAiPipelineChatState";

const AiPipelineChatContext = createContext<AiPipelineChatState | null>(null);

export function AiPipelineChatProvider({
  children,
}: {
  children: ReactNode;
}): ReactElement {
  const value = useAiPipelineChatState();
  return (
    <AiPipelineChatContext.Provider value={value}>
      {children}
    </AiPipelineChatContext.Provider>
  );
}

export function useAiPipelineChat(): AiPipelineChatState {
  const ctx = useContext(AiPipelineChatContext);
  if (!ctx) {
    throw new Error("useAiPipelineChat requires AiPipelineChatProvider");
  }
  return ctx;
}
