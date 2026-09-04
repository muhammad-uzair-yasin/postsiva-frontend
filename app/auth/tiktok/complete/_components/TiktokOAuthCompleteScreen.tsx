"use client";

import Link from "next/link";

import { useTiktokOAuthComplete } from "../_hooks/useTiktokOAuthComplete";

export function TiktokOAuthCompleteScreen(): React.ReactElement {
  const { phase, message } = useTiktokOAuthComplete();

  if (phase === "loading") {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-surface px-6 text-on-surface">
        <p className="text-lg font-semibold">Completing TikTok sign-in…</p>
        <p className="text-sm text-on-surface-variant">
          Securing your session and loading workspaces.
        </p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-surface px-6 text-center text-on-surface">
      <p className="max-w-md text-lg font-semibold text-red-200" role="alert">
        {message ?? "Something went wrong."}
      </p>
      <Link
        className="rounded-xl bg-primary-container px-6 py-3 font-bold text-on-primary-container"
        href="/login"
      >
        Back to login
      </Link>
    </div>
  );
}
