import {
  getStoredActiveWorkspaceId,
  getStoredWorkspaces,
  setActiveWorkspaceId,
  STORAGE_KEY_LAST_WORKSPACE_ID,
} from "./session";

function getStoredLastWorkspaceId(): string | null {
  if (typeof window === "undefined") {
    return null;
  }
  return window.localStorage.getItem(STORAGE_KEY_LAST_WORKSPACE_ID);
}

/** Ensure an active workspace: keep current, restore last login choice, or pick first only if never selected. */
export function ensureActiveWorkspaceId(): string | null {
  const list = getStoredWorkspaces();
  if (list.length === 0) {
    return null;
  }

  const current = getStoredActiveWorkspaceId()?.trim();
  if (current && list.some((w) => w.id === current)) {
    return current;
  }

  const last = getStoredLastWorkspaceId()?.trim();
  if (last && list.some((w) => w.id === last)) {
    setActiveWorkspaceId(last);
    return last;
  }

  if (!last) {
    const first = list[0]!.id;
    setActiveWorkspaceId(first);
    return first;
  }

  const fallback = list[0]!.id;
  setActiveWorkspaceId(fallback);
  return fallback;
}
