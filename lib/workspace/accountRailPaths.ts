/** Routes that use the centralized account-rail two-column layout. */
export const WORKSPACE_ACCOUNT_RAIL_PATH_PREFIXES = [
  "/dashboard",
  "/inbox",
  "/post-scheduler/calendar",
  "/content-manager",
  "/ai-watcher",
] as const;

export function pathnameUsesWorkspaceAccountRail(pathname: string): boolean {
  return WORKSPACE_ACCOUNT_RAIL_PATH_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}
