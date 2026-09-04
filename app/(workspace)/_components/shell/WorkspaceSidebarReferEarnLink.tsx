"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactElement } from "react";

import { useTranslations } from "@/lib/i18n/WorkspaceLocaleProvider";

interface WorkspaceSidebarReferEarnLinkProps {
  readonly showExpandedContent: boolean;
}

export function WorkspaceSidebarReferEarnLink({
  showExpandedContent,
}: WorkspaceSidebarReferEarnLinkProps): ReactElement {
  const { t } = useTranslations();
  const pathname = usePathname();
  const href = "/referrals";
  const isActive = pathname === href || pathname.startsWith(`${href}/`);
  const label = t("nav.referEarn");

  return (
    <div
      className={`shrink-0 border-t border-outline-variant/15 ${
        showExpandedContent ? "px-3 py-3" : "flex w-full justify-center px-2 py-3"
      }`}
    >
      <Link
        href={href}
        aria-label={label}
        title={showExpandedContent ? undefined : label}
        className={`text-sm font-medium transition-colors ${
          showExpandedContent
            ? "flex w-full items-center gap-3 rounded-lg px-3 py-2.5"
            : "flex h-10 w-10 items-center justify-center rounded-lg p-0"
        } ${
          isActive
            ? "bg-primary text-on-primary"
            : "text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface"
        }`}
      >
        <span className="material-symbols-outlined shrink-0 text-xl">card_giftcard</span>
        <span
          className={`overflow-hidden whitespace-nowrap transition-all duration-300 ease-in-out ${
            showExpandedContent ? "max-w-[12rem] opacity-100" : "max-w-0 opacity-0"
          }`}
        >
          {label}
        </span>
      </Link>
    </div>
  );
}
