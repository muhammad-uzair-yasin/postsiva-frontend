"use client";

import type { AuthWorkspaceLoginItem } from "@/lib/auth/types";
import { userIdsEqual } from "@/lib/auth/userIdsEqual";

export function isWorkspaceOwner(
  workspace: AuthWorkspaceLoginItem | null,
  userId: string | undefined,
): boolean {
  if (!workspace || !userId?.trim()) return false;
  return userIdsEqual(userId, workspace.owner_id);
}
