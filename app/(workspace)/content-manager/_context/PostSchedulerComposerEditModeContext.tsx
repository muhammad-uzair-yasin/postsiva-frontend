"use client";

import { createContext, useContext, type ReactNode } from "react";

export type WordPressComposerEditMode = "draft" | "scheduled";

export interface PostSchedulerComposerEditModeValue {
  readonly active: boolean;
  readonly mode: WordPressComposerEditMode | null;
  readonly hideChannelPicker: boolean;
}

const PostSchedulerComposerEditModeContext =
  createContext<PostSchedulerComposerEditModeValue>({
    active: false,
    mode: null,
    hideChannelPicker: false,
  });

export function PostSchedulerComposerEditModeProvider({
  mode,
  children,
}: {
  mode: WordPressComposerEditMode;
  children: ReactNode;
}): React.ReactElement {
  return (
    <PostSchedulerComposerEditModeContext.Provider
      value={{ active: true, mode, hideChannelPicker: true }}
    >
      {children}
    </PostSchedulerComposerEditModeContext.Provider>
  );
}

export function usePostSchedulerComposerEditMode(): PostSchedulerComposerEditModeValue {
  return useContext(PostSchedulerComposerEditModeContext);
}
