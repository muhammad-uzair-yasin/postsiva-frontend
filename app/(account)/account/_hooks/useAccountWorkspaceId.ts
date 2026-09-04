"use client";

import { useActiveWorkspaceId } from "@/app/(workspace)/_hooks/useActiveWorkspaceId";
import { getStoredWorkspaces } from "@/lib/auth/session";

/**
 * AI usage / owner-scoped reads still require a workspace header even though the
 * ledger is owner-scoped. Resolve the active workspace, else fall back to the
 * user's first stored workspace so account-level views load outside any workspace.
 */
export function useAccountWorkspaceId(): string | null {
  const active = useActiveWorkspaceId();
  if (active) {
    return active;
  }
  const first = getStoredWorkspaces()[0]?.id;
  return first ?? null;
}
