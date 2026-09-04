"use client";

import { createContext, useContext } from "react";

interface PostSchedulerAiContextValue {
  openAiPanel: () => void;
  closeAiPanel: () => void;
  toggleAiPanel: () => void;
  aiPanelOpen: boolean;
}

const PostSchedulerAiContext = createContext<PostSchedulerAiContextValue | null>(
  null,
);

export function usePostSchedulerAi(): PostSchedulerAiContextValue {
  const value = useContext(PostSchedulerAiContext);
  if (!value) {
    throw new Error("usePostSchedulerAi must be used within PostSchedulerAiDrawerHost");
  }
  return value;
}

export { PostSchedulerAiContext };
export type { PostSchedulerAiContextValue };
