"use client";

import { useSyncExternalStore } from "react";

import {
  isPostSchedulerComposerOverlayOpen,
  subscribePostSchedulerComposerOverlay,
} from "@/lib/workspace/postSchedulerComposerOverlayState";

import { useWorkspaceComposerModalOpen } from "../_components/WorkspaceComposerModalProvider";

/** True when any post composer drawer/modal is open (provider or direct mount). */
export function usePostSchedulerComposerOverlayOpen(): boolean {
  const fromProvider = useWorkspaceComposerModalOpen();
  const fromOverlay = useSyncExternalStore(
    subscribePostSchedulerComposerOverlay,
    isPostSchedulerComposerOverlayOpen,
    () => false,
  );
  return fromProvider || fromOverlay;
}
