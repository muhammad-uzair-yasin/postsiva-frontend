"use client";

import Link from "next/link";
import { profileImageUrlFromUser } from "@/lib/auth/userAvatar";
import { getStoredActiveWorkspaceId } from "@/lib/auth/session";
import { useTranslations } from "@/lib/i18n/WorkspaceLocaleProvider";
import { useStoredAuthUser } from "../_hooks/useStoredAuthUser";
import { useStoredWorkspaces } from "../workspaces/_hooks/useStoredWorkspaces";

type WorkspaceNavUserProfileVariant = "dashboard" | "selection";

function displayNameFromUser(
  user: {
    full_name: string;
    username: string;
    email: string;
  },
  accountFallback: string,
): string {
  let raw: string;
  const full = user.full_name?.trim();
  if (full) {
    raw = full;
  } else {
    const u = user.username?.trim();
    if (u) {
      raw = u;
    } else {
      const email = user.email?.trim();
      if (email) {
        const at = email.indexOf("@");
        raw = at > 0 ? email.slice(0, at) : email;
      } else {
        raw = accountFallback;
      }
    }
  }
  return raw.toUpperCase();
}

function initialsFromDisplayName(name: string): string {
  const cleaned = name.trim();
  if (!cleaned) {
    return "?";
  }
  const parts = cleaned.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    const a = parts[0]?.[0];
    const b = parts[1]?.[0];
    if (a && b) {
      return (a + b).toUpperCase();
    }
  }
  return cleaned.slice(0, 2).toUpperCase();
}

interface WorkspaceNavUserProfileProps {
  variant: WorkspaceNavUserProfileVariant;
}

export function WorkspaceNavUserProfile({
  variant,
}: WorkspaceNavUserProfileProps): React.ReactElement {
  const { t } = useTranslations();
  const { user, isReady } = useStoredAuthUser();
  const { workspaces } = useStoredWorkspaces();

  const accountFallback = t("settings.account").toUpperCase();
  const displayName = user
    ? displayNameFromUser(user, accountFallback)
    : isReady
      ? accountFallback
      : "…";

  const activeWsId = getStoredActiveWorkspaceId();
  const activeWorkspace = workspaces.find((w) => w.id === activeWsId);
  const workspaceName = activeWorkspace?.name?.trim() || t("settings.workspace");
  const imageUrl = user ? profileImageUrlFromUser(user) : null;

  const isDashboard = variant === "dashboard";

  const shellClass = isDashboard
    ? "flex items-center gap-2.5 rounded-full border border-transparent py-1.5 pl-1.5 pr-2.5 text-on-surface-variant transition-colors duration-200 hover:border-outline-variant/40 hover:bg-surface-container hover:text-secondary sm:gap-3.5 sm:pr-4"
    : "flex items-center gap-2.5 rounded-full border border-transparent py-1.5 pl-1.5 pr-2.5 text-on-surface-variant transition-all hover:border-outline-variant/20 hover:bg-surface-container-high sm:gap-3.5 sm:pr-4";

  const nameClass = isDashboard
    ? "text-sm font-bold leading-tight text-on-surface sm:text-[15px]"
    : "text-sm font-bold leading-tight text-on-surface sm:text-[15px]";

  const planClass = isDashboard
    ? "text-[11px] font-medium uppercase tracking-wide text-secondary sm:text-xs"
    : "text-[11px] font-medium uppercase tracking-wide text-primary sm:text-xs";

  const avatarRing = isDashboard
    ? "ring-2 ring-primary/30"
    : "ring-2 ring-primary-container/30";

  const avatarBg = isDashboard
    ? "border border-primary/20 bg-primary-container"
    : "border border-primary/20 bg-primary-container";

  return (
    <Link href="/account/profile" className={shellClass} aria-label={t("nav.accountAndSettings")}>
      <div
        className={`flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full sm:h-11 sm:w-11 ${avatarBg} ${avatarRing}`}
      >
        {imageUrl ? (
          <img
            alt={displayName}
            className="h-full w-full object-cover"
            src={imageUrl}
          />
        ) : (
          <span
            className="text-xs font-bold text-on-primary-container sm:text-[13px]"
            aria-hidden
          >
            {initialsFromDisplayName(displayName)}
          </span>
        )}
      </div>
      <div className="hidden text-left sm:block">
        <p className={nameClass}>{displayName}</p>
        <p className={planClass}>{workspaceName}</p>
      </div>
    </Link>
  );
}
