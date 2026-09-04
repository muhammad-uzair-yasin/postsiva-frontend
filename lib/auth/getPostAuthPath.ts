import { getOnboardingPath } from "./onboarding";
import { ensureActiveWorkspaceId } from "./ensureActiveWorkspace";
import { getStoredWorkspaces } from "./session";
import type { AuthUser } from "./types";
import { isConnectOnboardingComplete, resolvePostAuthWorkspacePath } from "./workspaceOnboarding";

const POST_AUTH_NEXT_KEY = "postsiva_post_auth_next";

export function getSafeNextPath(value: string | null | undefined): string | null {
  const path = value?.trim();
  if (!path || !path.startsWith("/") || path.startsWith("//")) {
    return null;
  }
  try {
    const url = new URL(path, "https://postsiva.local");
    if (url.origin !== "https://postsiva.local") {
      return null;
    }
    return `${url.pathname}${url.search}${url.hash}`;
  } catch {
    return null;
  }
}

function getSafePostAuthNextPath(
  value: string | null | undefined,
): string | null {
  const next = getSafeNextPath(value);
  if (next?.startsWith("/login") || next?.startsWith("/signup")) {
    return null;
  }
  return next;
}

export function getPostAuthPath(
  user: AuthUser,
  options?: {
    nextPath?: string | null;
    activeWorkspaceId?: string | null;
  },
): string {
  const onboarding = getOnboardingPath(user);
  if (onboarding) {
    storePostAuthNextPath(options?.nextPath);
    return onboarding;
  }
  const next = getSafePostAuthNextPath(options?.nextPath);
  const workspaceCount = getStoredWorkspaces().length;
  if (workspaceCount > 0) {
    ensureActiveWorkspaceId();
  }
  return resolvePostAuthWorkspacePath(
    workspaceCount,
    next,
    isConnectOnboardingComplete(),
  );
}

export function storePostAuthNextPath(value: string | null | undefined): void {
  if (typeof window === "undefined") return;
  const safe = getSafePostAuthNextPath(value);
  if (safe) window.sessionStorage.setItem(POST_AUTH_NEXT_KEY, safe);
  else window.sessionStorage.removeItem(POST_AUTH_NEXT_KEY);
}

export function consumePostAuthNextPath(): string | null {
  if (typeof window === "undefined") return null;
  const value = window.sessionStorage.getItem(POST_AUTH_NEXT_KEY);
  window.sessionStorage.removeItem(POST_AUTH_NEXT_KEY);
  return getSafeNextPath(value);
}
