import type {
  AuthUser,
  AuthWorkspaceLoginItem,
  LoginSuccessPayload,
} from "./types";
import { clearStoredHeaderAccountSelections } from "@/lib/workspace/headerAccountSelection";
import { clearWorkspaceSwitchCaches } from "@/lib/workspace/clearWorkspaceSwitchCaches";

const ACCESS = "postsiva_access_token";
const USER = "postsiva_user";
const WORKSPACES = "postsiva_workspaces";
export const STORAGE_KEY_WORKSPACE_ID = "postsiva_workspace_id";
/** Persists across logout so the same workspace is restored on the next login. */
export const STORAGE_KEY_LAST_WORKSPACE_ID = "postsiva_last_workspace_id";

/** Same-tab listeners (e.g. workspace list) refresh when local workspace cache is patched. */
export const POSTSIVA_WORKSPACES_CHANGED = "postsiva_workspaces_changed";

/** Fired when `postsiva_workspace_id` changes (same-tab); use with `useSyncExternalStore` subscribers. */
export const POSTSIVA_ACTIVE_WORKSPACE_CHANGED = "postsiva_active_workspace_changed";
export const POSTSIVA_SESSION_EXPIRED = "postsiva_session_expired";
export const POSTSIVA_USER_CHANGED = "postsiva_user_changed";

export interface SessionExpiredDetail {
  loginUrl: string;
}

let pendingSessionExpiry: SessionExpiredDetail | null = null;

export function getPendingSessionExpiry(): SessionExpiredDetail | null {
  return pendingSessionExpiry;
}

function notifyActiveWorkspaceChanged(): void {
  if (typeof window === "undefined") {
    return;
  }
  window.dispatchEvent(new Event(POSTSIVA_ACTIVE_WORKSPACE_CHANGED));
}

export function patchStoredWorkspace(
  workspaceId: string,
  patch: Partial<AuthWorkspaceLoginItem>,
): void {
  if (typeof window === "undefined") {
    return;
  }
  const list = getStoredWorkspaces();
  const next = list.map((w) =>
    w.id === workspaceId ? { ...w, ...patch } : w,
  );
  window.localStorage.setItem(WORKSPACES, JSON.stringify(next));
  window.dispatchEvent(new Event(POSTSIVA_WORKSPACES_CHANGED));
}

export function saveLoginSession(payload: LoginSuccessPayload): void {
  if (typeof window === "undefined") {
    return;
  }
  window.localStorage.setItem(ACCESS, payload.access_token);
  pendingSessionExpiry = null;
  window.localStorage.setItem(USER, JSON.stringify(payload.user));
  window.dispatchEvent(new Event(POSTSIVA_USER_CHANGED));
  window.localStorage.setItem(WORKSPACES, JSON.stringify(payload.workspaces));
  window.localStorage.removeItem(STORAGE_KEY_WORKSPACE_ID);

  const resolved = resolveWorkspaceIdAfterLogin(payload.workspaces);
  if (resolved) {
    setActiveWorkspaceId(resolved);
  } else {
    notifyActiveWorkspaceChanged();
  }
}

function getStoredLastWorkspaceId(): string | null {
  if (typeof window === "undefined") {
    return null;
  }
  return window.localStorage.getItem(STORAGE_KEY_LAST_WORKSPACE_ID);
}

/** Restore last workspace on login; first workspace only when user never picked one before. */
function resolveWorkspaceIdAfterLogin(
  workspaces: AuthWorkspaceLoginItem[],
): string | null {
  if (workspaces.length === 0) {
    return null;
  }
  const last = getStoredLastWorkspaceId()?.trim();
  if (last && workspaces.some((w) => w.id === last)) {
    return last;
  }
  if (!last) {
    return workspaces[0]!.id;
  }
  return workspaces[0]!.id;
}

export function getStoredAccessToken(): string | null {
  if (typeof window === "undefined") {
    return null;
  }
  return window.localStorage.getItem(ACCESS);
}

export function getStoredUser(): AuthUser | null {
  if (typeof window === "undefined") {
    return null;
  }
  const raw = window.localStorage.getItem(USER);
  if (!raw) {
    return null;
  }
  try {
    return JSON.parse(raw) as AuthUser;
  } catch {
    return null;
  }
}

export function setStoredUser(user: AuthUser): void {
  if (typeof window === "undefined") {
    return;
  }
  window.localStorage.setItem(USER, JSON.stringify(user));
  window.dispatchEvent(new Event(POSTSIVA_USER_CHANGED));
}

export function getStoredWorkspaces(): AuthWorkspaceLoginItem[] {
  if (typeof window === "undefined") {
    return [];
  }
  const raw = window.localStorage.getItem(WORKSPACES);
  if (!raw) {
    return [];
  }
  try {
    return JSON.parse(raw) as AuthWorkspaceLoginItem[];
  } catch {
    return [];
  }
}

/** Replace cached workspace list (e.g. after refetch from GET /workspaces). */
export function setStoredWorkspaces(
  workspaces: AuthWorkspaceLoginItem[],
): void {
  if (typeof window === "undefined") {
    return;
  }
  window.localStorage.setItem(WORKSPACES, JSON.stringify(workspaces));
  window.dispatchEvent(new Event(POSTSIVA_WORKSPACES_CHANGED));
}

export function setActiveWorkspaceId(workspaceId: string): void {
  if (typeof window === "undefined") {
    return;
  }
  const previous = window.localStorage.getItem(STORAGE_KEY_WORKSPACE_ID);
  if (previous === workspaceId) {
    return;
  }
  clearWorkspaceSwitchCaches();
  window.localStorage.setItem(STORAGE_KEY_WORKSPACE_ID, workspaceId);
  window.localStorage.setItem(STORAGE_KEY_LAST_WORKSPACE_ID, workspaceId);
  notifyActiveWorkspaceChanged();
}

export function getStoredActiveWorkspaceId(): string | null {
  if (typeof window === "undefined") {
    return null;
  }
  return window.localStorage.getItem(STORAGE_KEY_WORKSPACE_ID);
}

/** Clear JWT, user, workspaces, and active workspace (sign out).
 * Device prefs (e.g. Piva FAB position in `pivaFabPositionStorage`) are kept. */
export function clearLoginSession(): void {
  if (typeof window === "undefined") {
    return;
  }
  window.localStorage.removeItem(ACCESS);
  window.localStorage.removeItem("postsiva_refresh_token");
  window.localStorage.removeItem(USER);
  window.dispatchEvent(new Event(POSTSIVA_USER_CHANGED));
  window.localStorage.removeItem(WORKSPACES);
  window.localStorage.removeItem(STORAGE_KEY_WORKSPACE_ID);
  // Keep STORAGE_KEY_LAST_WORKSPACE_ID so the next login restores the same workspace.
  clearStoredHeaderAccountSelections();
  window.sessionStorage.clear();
  notifyActiveWorkspaceChanged();
}

/** After expired/invalid JWT: clear storage and show the session-expired modal. */
export function redirectToLoginAfterFailedSession(
  failedAccessToken: string,
): never {
  if (typeof window === "undefined") {
    throw new Error("Session expired. Please sign in again.");
  }
  if (pendingSessionExpiry?.loginUrl) {
    window.dispatchEvent(
      new CustomEvent<SessionExpiredDetail>(POSTSIVA_SESSION_EXPIRED, {
        detail: { loginUrl: pendingSessionExpiry.loginUrl },
      }),
    );
    throw new Error("Session expired. Please sign in again.");
  }
  const currentToken = getStoredAccessToken()?.trim() ?? "";
  const failedToken = failedAccessToken.trim();
  if (!failedToken) {
    throw new Error("Session expired. Please sign in again.");
  }
  if (currentToken && currentToken !== failedToken) {
    throw new Error("The request used an expired session.");
  }
  const onAuthRoute = ["/login", "/signup"].some((route) =>
    window.location.pathname.startsWith(route),
  );
  const params = new URLSearchParams({ session: "expired" });
  if (!onAuthRoute) {
    params.set("next", `${window.location.pathname}${window.location.search}`);
  }
  const loginUrl = `/login?${params.toString()}`;
  pendingSessionExpiry = { loginUrl };
  clearLoginSession();
  window.dispatchEvent(
    new CustomEvent<SessionExpiredDetail>(POSTSIVA_SESSION_EXPIRED, {
      detail: { loginUrl },
    }),
  );
  throw new Error("Session expired. Please sign in again.");
}

/** @deprecated Use redirectToLoginAfterFailedSession */
export const redirectToLoginAfterFailedSessionRefresh =
  redirectToLoginAfterFailedSession;
