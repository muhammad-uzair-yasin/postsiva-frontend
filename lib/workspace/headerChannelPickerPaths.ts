import { pathnameIsWorkspaceSidebarSubpage } from "./workspaceSidebarSubpages";

/** Routes where the header social-account picker is hidden. */
export function pathnameHidesWorkspaceChannelPicker(pathname: string): boolean {
  if (pathname === "/settings" || pathname.startsWith("/settings/")) {
    return true;
  }
  if (pathnameIsWorkspaceSidebarSubpage(pathname)) {
    return true;
  }
  return pathname === "/account" || pathname.startsWith("/account/");
}
