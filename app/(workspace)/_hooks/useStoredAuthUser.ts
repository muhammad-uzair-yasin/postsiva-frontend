"use client";

import { useEffect, useState } from "react";
import type { AuthUser } from "@/lib/auth/types";
import { getStoredUser, POSTSIVA_USER_CHANGED } from "@/lib/auth/session";

/**
 * User for the workspace shell (header, etc.). Uses the login payload persisted in
 * `postsiva_user` only — no GET /auth/me; avoid redundant round-trips when the session
 * already contains the same fields from login.
 */
export function useStoredAuthUser(): {
  user: AuthUser | null;
  isReady: boolean;
} {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const refresh = (): void => {
      setUser(getStoredUser());
      setIsReady(true);
    };
    refresh();
    window.addEventListener(POSTSIVA_USER_CHANGED, refresh);
    window.addEventListener("storage", refresh);
    return () => {
      window.removeEventListener(POSTSIVA_USER_CHANGED, refresh);
      window.removeEventListener("storage", refresh);
    };
  }, []);

  return { user, isReady };
}
