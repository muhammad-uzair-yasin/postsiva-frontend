/** Per-workspace sidebar / header channel selection (survives page refresh). */

const STORAGE_KEY = "postsiva_workspace_header_account";

function readMap(): Record<string, string> {
  if (typeof window === "undefined") {
    return {};
  }
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return {};
  }
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!parsed || typeof parsed !== "object") {
      return {};
    }
    return parsed as Record<string, string>;
  } catch {
    return {};
  }
}

function writeMap(map: Record<string, string>): void {
  if (typeof window === "undefined") {
    return;
  }
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(map));
}

export function getStoredHeaderAccountId(
  workspaceId: string | null | undefined,
): string | null {
  const ws = (workspaceId ?? "").trim();
  if (!ws) {
    return null;
  }
  const id = readMap()[ws];
  return typeof id === "string" && id.trim().length > 0 ? id.trim() : null;
}

export function setStoredHeaderAccountId(
  workspaceId: string,
  accountId: string,
): void {
  const ws = workspaceId.trim();
  const id = accountId.trim();
  if (!ws || !id) {
    return;
  }
  const map = readMap();
  map[ws] = id;
  writeMap(map);
}

export function clearStoredHeaderAccountSelections(): void {
  if (typeof window === "undefined") {
    return;
  }
  window.localStorage.removeItem(STORAGE_KEY);
}
