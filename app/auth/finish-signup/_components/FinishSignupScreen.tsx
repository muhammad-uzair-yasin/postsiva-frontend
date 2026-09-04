"use client";

import Link from "next/link";

import { useFinishSignup } from "../_hooks/useFinishSignup";

export function FinishSignupScreen(): React.ReactElement {
  const {
    providerName,
    email,
    setEmail,
    password,
    setPassword,
    loading,
    error,
    submit,
  } = useFinishSignup();

  return (
    <div className="flex min-h-screen items-center justify-center bg-surface px-6 py-12 text-on-surface">
      <div className="w-full max-w-md">
        <h1 className="text-2xl font-bold tracking-tight">Finish signing up</h1>
        <p className="mt-2 text-sm text-on-surface-variant">
          {providerName} didn&apos;t share an email, so add one to finish creating
          your account. We&apos;ll send a code to verify it.
        </p>

        <form
          className="mt-8 flex flex-col gap-4"
          onSubmit={(e) => {
            e.preventDefault();
            void submit();
          }}
        >
          <label className="flex flex-col gap-1.5">
            <span className="text-sm font-bold">Email</span>
            <input
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="h-11 rounded-xl border border-outline-variant/25 bg-surface-container px-3 text-sm focus:border-secondary/50 focus:outline-none"
            />
          </label>

          <label className="flex flex-col gap-1.5">
            <span className="text-sm font-bold">Password</span>
            <input
              type="password"
              required
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Create a password"
              className="h-11 rounded-xl border border-outline-variant/25 bg-surface-container px-3 text-sm focus:border-secondary/50 focus:outline-none"
            />
          </label>

          {error ? (
            <div
              className="rounded-xl border border-error/25 bg-error/5 px-3 py-2.5 text-sm text-error"
              role="alert"
            >
              {error}{" "}
              <Link href="/login" className="font-bold underline">
                Log in
              </Link>
            </div>
          ) : null}

          <button
            type="submit"
            disabled={loading}
            className="mt-2 h-11 rounded-xl bg-primary text-sm font-bold text-on-primary transition-colors hover:bg-primary/90 disabled:opacity-60"
          >
            {loading ? "Creating account…" : "Continue"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-on-surface-variant">
          <Link href="/login" className="font-bold text-primary hover:underline">
            Back to login
          </Link>
        </p>
      </div>
    </div>
  );
}
