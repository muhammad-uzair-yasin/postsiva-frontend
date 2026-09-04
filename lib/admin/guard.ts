/** Pure admin-access decision logic (unit-tested in tests/admin-guard.test.mjs). */

export interface AdminGuardUser {
  is_admin: boolean;
  is_active: boolean;
}

export type AdminAccessDecision =
  | { kind: "allow" }
  | { kind: "login"; redirect: string }
  | { kind: "forbidden" };

/** Build the login redirect preserving the requested admin path. */
export function adminLoginRedirect(path: string): string {
  const safe = path.startsWith("/admin") ? path : "/admin";
  return `/admin/login?next=${encodeURIComponent(safe)}`;
}

/**
 * Decide access for an /admin page.
 * - No token → send to admin login (with next).
 * - Known user that is not an active admin → forbidden screen (no redirect
 *   loop; the account is signed in, just not allowed).
 * - Active admin → allow.
 */
export function resolveAdminAccess(
  hasToken: boolean,
  user: AdminGuardUser | null,
  path: string,
): AdminAccessDecision {
  if (!hasToken) {
    return { kind: "login", redirect: adminLoginRedirect(path) };
  }
  if (!user) {
    // Token present but user not yet resolved — caller fetches /auth/me first.
    return { kind: "allow" };
  }
  if (!user.is_admin || !user.is_active) {
    return { kind: "forbidden" };
  }
  return { kind: "allow" };
}

/** Sanitize a ?next= value so login can only bounce back inside /admin. */
export function safeAdminNext(next: string | null | undefined): string {
  if (!next || !next.startsWith("/admin") || next.startsWith("//")) {
    return "/admin";
  }
  return next;
}
