/** Primary destinations linked from the workspace block in the main sidebar. */
export const WORKSPACE_SIDEBAR_SUBPAGE_PREFIXES = [
  "/accounts",
  "/referrals",
  "/integrations",
  "/settings/members",
  "/settings/persona",
  "/settings/ai",
] as const;

export function pathnameIsWorkspaceSidebarSubpage(pathname: string): boolean {
  return WORKSPACE_SIDEBAR_SUBPAGE_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}
