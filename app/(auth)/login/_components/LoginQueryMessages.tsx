"use client";

import { useSearchParams } from "next/navigation";

export function LoginQueryMessages(): React.ReactElement | null {
  const searchParams = useSearchParams();
  const registered = searchParams.get("registered") === "1";
  const reset = searchParams.get("reset") === "1";
  const sessionExpired = searchParams.get("session") === "expired";

  if (reset) {
    return (
      <div className="border-b border-secondary/25 bg-secondary/10 px-4 py-3 text-center text-sm text-on-surface">
        Your password was updated. Sign in with your new password.
      </div>
    );
  }

  if (sessionExpired) {
    return (
      <div className="border-b border-secondary/25 bg-secondary/10 px-4 py-3 text-center text-sm text-on-surface">
        Your session has expired. Please sign in again to continue.
      </div>
    );
  }

  if (registered) {
    return (
      <div className="border-b border-secondary/25 bg-secondary/10 px-4 py-3 text-center text-sm text-on-surface">
        Account created. Sign in with your email and password. If prompted,
        check your inbox to verify your email.
      </div>
    );
  }

  return null;
}
