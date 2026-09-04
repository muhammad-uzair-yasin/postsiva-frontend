export function defaultSkippedWorkspaceName(
  username?: string | null,
  fullName?: string | null,
): string {
  const base = (username?.trim() || fullName?.trim() || "My").trim();
  return `${base} workspace`;
}

/** @deprecated Use defaultSkippedWorkspaceName — kept for tests. */
export const DEFAULT_WORKSPACE_NAME = "My workspace";

const CONNECT_ONBOARDING_DONE_KEY = "postsiva_connect_onboarding_done";

export function isConnectOnboardingComplete(): boolean {
  if (typeof window === "undefined") {
    return true;
  }
  return window.sessionStorage.getItem(CONNECT_ONBOARDING_DONE_KEY) === "1";
}

export function markConnectOnboardingComplete(): void {
  if (typeof window === "undefined") {
    return;
  }
  window.sessionStorage.setItem(CONNECT_ONBOARDING_DONE_KEY, "1");
}

export function isOnboardingRoute(pathname: string): boolean {
  return pathname === "/onboarding" || pathname.startsWith("/onboarding/");
}

/** Pure post-auth workspace step (no storage reads). */
export function resolvePostAuthWorkspacePath(
  workspaceCount: number,
  next: string | null,
  connectOnboardingComplete: boolean,
): string {
  if (next && !next.startsWith("/onboarding")) {
    return next;
  }
  if (workspaceCount === 0) {
    return "/onboarding/workspace";
  }
  if (!connectOnboardingComplete) {
    return "/onboarding/connect";
  }
  return next ?? "/dashboard";
}
