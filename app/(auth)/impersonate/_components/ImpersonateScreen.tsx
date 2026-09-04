"use client";

import Link from "next/link";

import { AuthPageFrame } from "@/app/(auth)/_components/AuthPageFrame";
import { POSTSIVA_LOGO_SRC } from "@/lib/brandAssets";

import { useImpersonateHandoff } from "../_hooks/useImpersonateHandoff";

export function ImpersonateScreen(): React.ReactElement {
  const { status, error } = useImpersonateHandoff();

  return (
    <AuthPageFrame>
      <div className="flex min-h-screen flex-1 flex-col items-center justify-center bg-surface-container-lowest p-6">
        <img
          alt=""
          className="mb-8 h-10 w-10 rounded-xl object-cover"
          src={POSTSIVA_LOGO_SRC}
        />
        {status === "loading" ? (
          <p className="text-sm text-on-surface-variant">
            Signing you in as support session…
          </p>
        ) : (
          <div className="max-w-md text-center">
            <h1 className="mb-2 text-xl font-semibold text-on-surface">
              Impersonation failed
            </h1>
            <p className="mb-6 text-sm text-on-surface-variant">
              {error ?? "Invalid or expired code."}
            </p>
            <Link href="/login" className="text-sm font-semibold text-primary underline">
              Back to login
            </Link>
          </div>
        )}
      </div>
    </AuthPageFrame>
  );
}
