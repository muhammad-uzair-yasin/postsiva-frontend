"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import type { AuthWorkspaceLoginItem } from "@/lib/auth/types";
import { fetchWorkspacesForSession } from "@/lib/auth/authApi";
import {
  getStoredAccessToken,
  getStoredWorkspaces,
  POSTSIVA_WORKSPACES_CHANGED,
  setStoredWorkspaces,
} from "@/lib/auth/session";

export function useStoredWorkspaces(): {
  workspaces: AuthWorkspaceLoginItem[];
  isReady: boolean;
  /** True while waiting for GET workspaces (logged-in user on `/workspaces`). */
  isLoadingWorkspaces: boolean;
} {
  const pathname = usePathname();
  const [workspaces, setWorkspaces] = useState<AuthWorkspaceLoginItem[]>([]);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const applyLocal = (): void => {
      setWorkspaces(getStoredWorkspaces());
    };

    const load = (): void => {
      applyLocal();
      setIsReady(true);
    };

    let cancelled = false;

    const token = getStoredAccessToken()?.trim() ?? "";
    const isWorkspaceSelection = pathname === "/workspaces";

    if (token && isWorkspaceSelection) {
      // Show cached workspaces immediately; only block with the loading skeleton
      // when there is nothing cached. Otherwise refresh silently in the
      // background so the list never flickers content → loading → content.
      const cached = getStoredWorkspaces();
      setWorkspaces(cached);
      setIsReady(cached.length > 0);
      void fetchWorkspacesForSession(token)
        .then((list) => {
          if (cancelled) {
            return;
          }
          setStoredWorkspaces(list);
          setWorkspaces(list);
          setIsReady(true);
        })
        .catch(() => {
          if (cancelled) {
            return;
          }
          load();
        });
    } else {
      load();
    }

    window.addEventListener(POSTSIVA_WORKSPACES_CHANGED, load);
    return () => {
      cancelled = true;
      window.removeEventListener(POSTSIVA_WORKSPACES_CHANGED, load);
    };
  }, [pathname]);

  const tokenPresent = Boolean(getStoredAccessToken()?.trim());
  const isLoadingWorkspaces =
    tokenPresent && pathname === "/workspaces" && !isReady;

  return { workspaces, isReady, isLoadingWorkspaces };
}
