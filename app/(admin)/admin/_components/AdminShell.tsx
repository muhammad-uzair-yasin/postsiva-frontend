"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LogOut, ShieldCheck } from "lucide-react";

import { clearLoginSession, getStoredUser } from "@/lib/auth/session";
import { logoutWithTokens } from "@/lib/auth/authApi";
import { getStoredAccessToken } from "@/lib/auth/session";

import { ADMIN_NAV_SECTIONS, isActiveAdminPath } from "./adminNav";

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const user = typeof window !== "undefined" ? getStoredUser() : null;

  const handleLogout = async () => {
    const token = getStoredAccessToken();
    clearLoginSession();
    void logoutWithTokens(token).catch(() => undefined);
    router.replace("/admin/login");
  };

  return (
    <div className="flex h-screen w-full overflow-hidden bg-surface text-on-surface">
      <aside className="hidden h-full w-60 shrink-0 flex-col border-r border-outline-variant/20 bg-surface-container-low md:flex">
        <div className="flex items-center gap-2 px-5 pb-4 pt-6">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/15 text-primary">
            <ShieldCheck className="h-4.5 w-4.5" />
          </span>
          <div>
            <p className="text-sm font-bold leading-tight">Postsiva Admin</p>
            <p className="text-[11px] text-on-surface-variant">Control center</p>
          </div>
        </div>
        <nav className="flex-1 space-y-4 overflow-y-auto px-3 pb-4">
          {ADMIN_NAV_SECTIONS.map((section) => (
            <div key={section.title}>
              <p className="px-2 pb-1 text-[10px] font-semibold uppercase tracking-wider text-on-surface-variant/70">
                {section.title}
              </p>
              <ul className="space-y-0.5">
                {section.items.map((item) => {
                  const active = isActiveAdminPath(pathname, item.href);
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        className={[
                          "flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-[13px] font-medium transition-colors",
                          active
                            ? "bg-primary/12 text-primary"
                            : "text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface",
                        ].join(" ")}
                      >
                        <item.icon className="h-4 w-4 shrink-0" />
                        {item.label}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>
        <div className="border-t border-outline-variant/20 px-3 py-3">
          <div className="flex items-center justify-between gap-2 px-2">
            <div className="min-w-0">
              <p className="truncate text-xs font-semibold">{user?.full_name || user?.username || "Admin"}</p>
              <p className="truncate text-[11px] text-on-surface-variant">{user?.email}</p>
            </div>
            <button
              type="button"
              onClick={handleLogout}
              title="Sign out"
              className="rounded-lg p-2 text-on-surface-variant transition-colors hover:bg-surface-container-high hover:text-on-surface"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </aside>
      <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
        <header className="flex shrink-0 items-center justify-between border-b border-outline-variant/15 bg-surface-container-lowest/60 px-4 py-3 backdrop-blur md:hidden">
          <span className="text-sm font-bold">Postsiva Admin</span>
          <button
            type="button"
            onClick={handleLogout}
            className="rounded-lg p-2 text-on-surface-variant hover:bg-surface-container-high"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </header>
        <main className="min-h-0 min-w-0 flex-1 overflow-y-auto overflow-x-hidden px-4 py-6 md:px-8">
          {children}
        </main>
      </div>
    </div>
  );
}
