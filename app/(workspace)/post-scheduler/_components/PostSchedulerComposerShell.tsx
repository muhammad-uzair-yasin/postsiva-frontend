"use client";

import type { ReactNode } from "react";

import { PostSchedulerActionToastProvider } from "../_context/PostSchedulerActionToastContext";
import { PostSchedulerComposerActionsBusyRootProvider } from "../_context/PostSchedulerComposerActionsBusyContext";
import { PostSchedulerComposerChannelsProvider } from "../_context/PostSchedulerComposerChannelsContext";
import { PostSchedulerComposerDraftProvider } from "../_context/PostSchedulerComposerDraftContext";
import type { ComposerSessionCacheSnapshot } from "@/lib/post-composer/composerSessionCache";
import { PostSchedulerComposerSessionCacheProvider } from "../_context/PostSchedulerComposerSessionCacheProvider";
import { PostSchedulerAiToolkitProvider } from "../_context/PostSchedulerAiToolkitContext";
import { PostSchedulerAiToolkitAlertLayer } from "./PostSchedulerAiToolkitAlertLayer";

/** Channels + draft + AI toolkit (same stack as mobile composer) for scheduler UIs. */
export function PostSchedulerComposerShell({
  children,
  lockedAccountId,
  sessionBootstrap,
}: {
  children: ReactNode;
  lockedAccountId?: string | null;
  /** When set (e.g. content-manager edit), initial state + session cache use this instead of stored cache. */
  sessionBootstrap?: ComposerSessionCacheSnapshot | null;
}): React.ReactElement {
  return (
    <PostSchedulerComposerChannelsProvider lockedAccountId={lockedAccountId}>
      <PostSchedulerComposerDraftProvider sessionBootstrap={sessionBootstrap}>
        <PostSchedulerComposerSessionCacheProvider
          sessionBootstrap={sessionBootstrap}
        >
        <PostSchedulerActionToastProvider>
          <PostSchedulerAiToolkitProvider>
            <PostSchedulerComposerActionsBusyRootProvider>
              <PostSchedulerAiToolkitAlertLayer />
              {children}
            </PostSchedulerComposerActionsBusyRootProvider>
          </PostSchedulerAiToolkitProvider>
        </PostSchedulerActionToastProvider>
        </PostSchedulerComposerSessionCacheProvider>
      </PostSchedulerComposerDraftProvider>
    </PostSchedulerComposerChannelsProvider>
  );
}
