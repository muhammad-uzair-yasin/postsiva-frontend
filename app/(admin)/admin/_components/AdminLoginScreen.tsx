"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2, ShieldCheck } from "lucide-react";

import { loginWithPassword } from "@/lib/auth/authApi";
import { clearLoginSession, saveLoginSession } from "@/lib/auth/session";
import { safeAdminNext } from "@/lib/admin/guard";

export function AdminLoginScreen() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (busy) return;
    setBusy(true);
    setError(null);
    try {
      const payload = await loginWithPassword(email, password);
      if (!payload.user.is_admin) {
        clearLoginSession();
        setError("This account does not have admin access.");
        return;
      }
      saveLoginSession(payload);
      router.replace(safeAdminNext(searchParams.get("next")));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-surface px-4">
      <div className="w-full max-w-sm rounded-3xl border border-outline-variant/20 bg-surface-container-low p-8 shadow-xl">
        <div className="mb-6 flex flex-col items-center gap-3 text-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/15 text-primary">
            <ShieldCheck className="h-6 w-6" />
          </span>
          <div>
            <h1 className="text-lg font-bold text-on-surface">Postsiva Admin</h1>
            <p className="text-sm text-on-surface-variant">
              Sign in with an admin account
            </p>
          </div>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <label className="block">
            <span className="mb-1 block text-xs font-semibold text-on-surface-variant">
              Email
            </span>
            <input
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-xl border border-outline-variant/30 bg-surface px-3.5 py-2.5 text-sm text-on-surface outline-none transition-colors focus:border-primary"
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-xs font-semibold text-on-surface-variant">
              Password
            </span>
            <input
              type="password"
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-xl border border-outline-variant/30 bg-surface px-3.5 py-2.5 text-sm text-on-surface outline-none transition-colors focus:border-primary"
            />
          </label>
          {error ? (
            <p className="rounded-xl bg-error-container px-3 py-2 text-xs font-medium text-on-error-container">
              {error}
            </p>
          ) : null}
          <button
            type="submit"
            disabled={busy}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-2.5 text-sm font-semibold text-on-primary transition-opacity hover:opacity-90 disabled:opacity-60"
          >
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            Sign in
          </button>
        </form>
      </div>
    </div>
  );
}
