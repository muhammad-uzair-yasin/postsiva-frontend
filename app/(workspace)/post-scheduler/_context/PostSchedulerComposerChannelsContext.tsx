"use client";

import { createContext, useContext } from "react";
import {
  useLockedComposerChannelState,
  usePostSchedulerChannelPickerState,
} from "../_hooks/usePostSchedulerChannelPickerState";

type ComposerChannelsValue = ReturnType<
  typeof usePostSchedulerChannelPickerState
>;

const PostSchedulerComposerChannelsContext =
  createContext<ComposerChannelsValue | null>(null);

export function PostSchedulerComposerChannelsProvider({
  children,
  lockedAccountId,
}: {
  children: React.ReactNode;
  lockedAccountId?: string | null;
}): React.ReactElement {
  const picker = usePostSchedulerChannelPickerState();
  const locked = useLockedComposerChannelState(lockedAccountId?.trim() ?? "");
  const value = lockedAccountId?.trim() ? locked : picker;
  return (
    <PostSchedulerComposerChannelsContext.Provider value={value}>
      {children}
    </PostSchedulerComposerChannelsContext.Provider>
  );
}

export function usePostSchedulerComposerChannels(): ComposerChannelsValue {
  const ctx = useContext(PostSchedulerComposerChannelsContext);
  if (!ctx) {
    throw new Error(
      "usePostSchedulerComposerChannels must be used within PostSchedulerComposerChannelsProvider",
    );
  }
  return ctx;
}

export function useOptionalPostSchedulerComposerChannels(): ComposerChannelsValue | null {
  return useContext(PostSchedulerComposerChannelsContext);
}
