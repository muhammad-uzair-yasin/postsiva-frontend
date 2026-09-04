"use client";

import { useSyncExternalStore } from "react";

import {
  getStoredActiveWorkspaceId,
  POSTSIVA_ACTIVE_WORKSPACE_CHANGED,
  STORAGE_KEY_WORKSPACE_ID,
} from "@/lib/auth/session";

function subscribe(onStoreChange: () => void): () => void {
  const onStorage = (e: StorageEvent): void => {
    if (e.key === STORAGE_KEY_WORKSPACE_ID || e.key === null) {
      onStoreChange();
    }
  };
  window.addEventListener("storage", onStorage);
  window.addEventListener(POSTSIVA_ACTIVE_WORKSPACE_CHANGED, onStoreChange);
  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(POSTSIVA_ACTIVE_WORKSPACE_CHANGED, onStoreChange);
  };
}

function getSnapshot(): string | null {
  const id = getStoredActiveWorkspaceId()?.trim() ?? "";
  return id.length > 0 ? id : null;
}

function getServerSnapshot(): null {
  return null;
}

/** Active `postsiva_workspace_id` from session; updates when the user selects a workspace or signs out. */
export function useActiveWorkspaceId(): string | null {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
