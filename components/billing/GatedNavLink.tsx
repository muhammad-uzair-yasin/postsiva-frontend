"use client";

import Link from "next/link";
import type { ReactElement, ReactNode } from "react";

import { useWorkspaceAccountSettings } from "@/app/(workspace)/_components/shell/WorkspaceAccountSettingsProvider";

type GatedNavLinkProps = {
  href: string;
  locked: boolean;
  className: string;
  title?: string;
  children: ReactNode;
};

export function GatedNavLink({
  href,
  locked,
  className,
  title,
  children,
}: GatedNavLinkProps): ReactElement {
  const { openBillingSettings } = useWorkspaceAccountSettings();
  const lockedClass = locked
    ? "cursor-not-allowed opacity-50 hover:bg-transparent hover:text-on-surface-variant"
    : "";

  if (locked) {
    return (
      <button
        type="button"
        onClick={() => openBillingSettings()}
        title={title ?? "Upgrade your plan to unlock"}
        className={`${className} ${lockedClass}`.trim()}
      >
        {children}
        <span
          className="material-symbols-outlined ml-auto shrink-0 text-base text-on-surface-variant"
          aria-hidden
        >
          lock
        </span>
      </button>
    );
  }

  return (
    <Link href={href} className={className}>
      {children}
    </Link>
  );
}
