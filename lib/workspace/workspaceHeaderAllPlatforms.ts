/** Workspace header dropdown: combined analytics/posts for every connected channel (GET /unified/* with no `platforms` filter). */
export const WORKSPACE_HEADER_ALL_PLATFORMS_ID = "__all_platforms__" as const;

export function isWorkspaceHeaderAllPlatformsId(
  id: string | null | undefined,
): boolean {
  return id === WORKSPACE_HEADER_ALL_PLATFORMS_ID;
}
