"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { ShieldAlert } from "lucide-react";

import { fetchCurrentUser } from "@/lib/auth/authApi";
import {
  clearLoginSession,
  getStoredAccessToken,
  getStoredUser,
  setStoredUser,
} from "@/lib/auth/session";
import { resolveAdminAccess } from "@/lib/admin/guard";

import { AdminShell } from "./AdminShell";

type GuardState = "checking" | "allowed" | "forbidden";

/** Wraps every /admin page except /admin/login with the admin guard + shell. */
export function AdminChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const isLoginPage = pathname === "/admin/login";
  const [state, setState] = useState<GuardState>("checking");

  useEffect(() => {
    if (isLoginPage) {
      return;
    }
    const token = getStoredAccessToken();
    const decision = resolveAdminAccess(Boolean(token), null, pathname);
    if (decision.kind === "login") {
      router.replace(decision.redirect);
      return;
    }
    let cancelled = false;
    const controller = new AbortController();
    fetchCurrentUser(token as string, controller.signal)
      .then((user) => {
        if (cancelled) return;
        setStoredUser(user);
        const fresh = resolveAdminAccess(true, user, pathname);
        setState(fresh.kind === "allow" ? "allowed" : "forbidden");
      })
      .catch(() => {
        // fetchWithAccessTokenRetry redirects on expired sessions; anything
        // else (network) keeps the stored-user decision rather than locking out.
        if (!cancelled) {
          const cached = getStoredUser();
          setState(cached?.is_admin ? "allowed" : "forbidden");
        }
      });
    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [isLoginPage, pathname, router]);

  if (isLoginPage) {
    return <>{children}</>;
  }

  if (state === "checking") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-surface">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-outline-variant border-t-primary" />
      </div>
    );
  }

  if (state === "forbidden") {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-surface px-6 text-center">
        <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-error-container text-on-error-container">
          <ShieldAlert className="h-7 w-7" />
        </span>
        <div>
          <h1 className="text-lg font-bold text-on-surface">Not authorized</h1>
          <p className="mt-1 max-w-sm text-sm text-on-surface-variant">
            This account does not have admin access. Sign in with an admin
            account to continue.
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            clearLoginSession();
            router.replace("/admin/login");
          }}
          className="rounded-full bg-primary px-5 py-2 text-sm font-semibold text-on-primary transition-opacity hover:opacity-90"
        >
          Switch account
        </button>
      </div>
    );
  }

  return <AdminShell>{children}</AdminShell>;
}
