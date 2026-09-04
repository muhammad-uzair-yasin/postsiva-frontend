"use client";

import { createContext, useContext, type ReactNode, type ReactElement } from "react";

import { useWorkspaceAiPrompts } from "@/lib/settings/useWorkspaceAiPrompts";
import type { WorkspaceAiPrompt } from "@/lib/settings/workspaceAiPromptsApi";

type QuickPromptsContextValue = ReturnType<typeof useWorkspaceAiPrompts>;

const PostSchedulerAiToolkitQuickPromptsContext =
  createContext<QuickPromptsContextValue | null>(null);

export function PostSchedulerAiToolkitQuickPromptsProvider({
  children,
}: {
  children: ReactNode;
}): ReactElement {
  const value = useWorkspaceAiPrompts();
  return (
    <PostSchedulerAiToolkitQuickPromptsContext.Provider value={value}>
      {children}
    </PostSchedulerAiToolkitQuickPromptsContext.Provider>
  );
}

export function usePostSchedulerAiToolkitQuickPrompts(): QuickPromptsContextValue {
  const ctx = useContext(PostSchedulerAiToolkitQuickPromptsContext);
  if (!ctx) {
    throw new Error(
      "usePostSchedulerAiToolkitQuickPrompts must be used within PostSchedulerAiToolkitQuickPromptsProvider",
    );
  }
  return ctx;
}

export type { WorkspaceAiPrompt };
