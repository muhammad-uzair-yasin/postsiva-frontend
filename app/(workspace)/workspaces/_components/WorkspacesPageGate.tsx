"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import type { ReactElement } from "react";

import { fetchWorkspacesForSession } from "@/lib/auth/authApi";
import { ensureActiveWorkspaceId } from "@/lib/auth/ensureActiveWorkspace";
import {
  getStoredAccessToken,
  getStoredWorkspaces,
  setStoredWorkspaces,
} from "@/lib/auth/session";

/** `/workspaces` is deprecated — auto-select first workspace and open the dashboard. */
export function WorkspacesPageGate(): ReactElement {
  const router = useRouter();

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      const token = getStoredAccessToken()?.trim() ?? "";
      let list = getStoredWorkspaces();
      if (list.length === 0 && token) {
        try {
          list = await fetchWorkspacesForSession(token);
          setStoredWorkspaces(list);
        } catch {
          /* keep empty */
        }
      }
      if (cancelled) return;
      ensureActiveWorkspaceId();
      router.replace("/dashboard");
    })();

    return () => {
      cancelled = true;
    };
  }, [router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-surface" role="status" aria-live="polite">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary/30 border-t-primary" />
    </div>
  );
}
