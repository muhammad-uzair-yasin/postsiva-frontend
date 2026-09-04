"use client";

import Link from "next/link";
import type { ReactElement } from "react";

import { PostsivaLogoMark } from "@/components/marketing/PostsivaLogoMark";

interface WorkspaceShellBrandProps {
  readonly showWordmark?: boolean;
}

export function WorkspaceShellBrand({
  showWordmark = true,
}: WorkspaceShellBrandProps): ReactElement {
  return (
    <Link
      href="/dashboard"
      className="flex min-w-0 items-center gap-2.5 overflow-hidden rounded-lg py-1 transition-opacity hover:opacity-90"
      aria-label="Postsiva home"
    >
      <span className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-md">
        <PostsivaLogoMark size={32} className="h-full w-full rounded-md object-cover" />
      </span>
      {showWordmark ? (
        <span className="truncate text-base font-bold tracking-tight text-on-surface">
          Post<span className="text-primary">siva</span>
        </span>
      ) : null}
    </Link>
  );
}
