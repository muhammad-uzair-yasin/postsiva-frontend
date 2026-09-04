"use client";

import { motion } from "framer-motion";
import type { ReactElement } from "react";
import { useDashboardProfileCard } from "../../_hooks/useDashboardProfileCard";
import { useWorkspaceHeaderAccounts } from "../../../_components/WorkspaceHeaderAccountsProvider";
import { SocialPlatformIcon } from "@/lib/social/SocialPlatformIcon";
import { isSocialPlatformIconId } from "@/lib/social/socialPlatformIconSrc";
import { getPlatformGradient } from "@/lib/social/socialPlatformGradients";
import { useTranslations } from "@/lib/i18n/WorkspaceLocaleProvider";
import { isWorkspaceHeaderAllPlatformsId } from "@/lib/workspace/workspaceHeaderAllPlatforms";
import { DashboardProfileHeaderRefreshButton } from "./DashboardProfileHeaderRefreshButton";
import {
  DASHBOARD_PROFILE_DEMO_BIO,
  DASHBOARD_PROFILE_DEMO_PRIMARY,
  DASHBOARD_PROFILE_DEMO_STATS,
  DASHBOARD_PROFILE_UNMAPPED_STATS,
  PROFILE_IMAGE_SRC,
} from "../../_data/dashboardStaticData";

export function DashboardProfileHeader(): ReactElement {
  const { t } = useTranslations();
  const { card, displayMode, selectedAccount } = useDashboardProfileCard();
  const { selectedAccount: headerAccount } = useWorkspaceHeaderAccounts();
  const isMapped = displayMode === "mapped";
  const isUnmapped = displayMode === "unmapped";
  const avatarSrc =
    isMapped && card?.avatarUrl ? card.avatarUrl : PROFILE_IMAGE_SRC;

  const primaryLine = isMapped
    ? (card?.primaryLine ?? DASHBOARD_PROFILE_DEMO_PRIMARY)
    : isUnmapped
      ? selectedAccount?.label ?? t("dashboard.profileAccountFallback")
      : DASHBOARD_PROFILE_DEMO_PRIMARY;
  const secondaryLine = isMapped ? card?.secondaryLine : isUnmapped ? selectedAccount?.hint : undefined;
  const stats = isMapped
    ? (card?.stats ?? [...DASHBOARD_PROFILE_DEMO_STATS])
    : isUnmapped
      ? [...DASHBOARD_PROFILE_UNMAPPED_STATS]
      : [...DASHBOARD_PROFILE_DEMO_STATS];

  const bio = isMapped
    ? card?.bio && card.bio.length > 0
      ? card.bio
      : t("dashboard.profileNoBio")
    : isUnmapped
      ? t("dashboard.profileUnmappedBio")
      : DASHBOARD_PROFILE_DEMO_BIO;

  const visitUrl = isMapped ? card?.visitUrl : null;
  const showVerified =
    displayMode === "demo" ? true : isMapped ? Boolean(card?.showVerifiedBadge) : false;
  const platformTag = isMapped
    ? card?.platformLabel
    : isUnmapped
      ? selectedAccount?.hint
      : null;

  const iconId = headerAccount?.iconId ?? "instagram";
  const safeIcon = isSocialPlatformIconId(iconId) ? iconId : "instagram";
  const gradientClass = getPlatformGradient(safeIcon);

  return (
    <motion.header
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 280, damping: 28 }}
      className="relative mb-4 rounded-2xl border border-outline-variant/10 bg-surface-container-low/70 p-3 shadow-[0_20px_50px_-24px_rgba(0,0,0,0.5)] ring-1 ring-white/5 backdrop-blur-md sm:mb-5 sm:p-5"
    >
      <div
        className="pointer-events-none absolute left-0 top-0 h-full w-full opacity-[0.12] motion-reduce:opacity-10"
        style={{
          background: "radial-gradient(at top left, #6B49D8 0%, transparent 45%)",
        }}
        aria-hidden
      />
      <div className="absolute bottom-0 right-0 h-32 w-32 rounded-full bg-secondary/10 blur-3xl motion-reduce:hidden" aria-hidden />
      <DashboardProfileHeaderRefreshButton />
      {headerAccount ? (() => {
        const iconId = headerAccount.iconId ?? "instagram";
        const safeIcon = isSocialPlatformIconId(iconId) ? iconId : "instagram";
        const isAll = isWorkspaceHeaderAllPlatformsId(headerAccount.id);
        return (
          <div className="relative z-10 mb-4 flex min-w-0 flex-wrap items-center gap-2">
            {isAll ? (
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-secondary/20 text-secondary">
                <span className="material-symbols-outlined text-lg">all_inclusive</span>
              </span>
            ) : (
              <SocialPlatformIcon platform={safeIcon} className="h-7 w-7 shrink-0 rounded-lg" alt="" />
            )}
            <span className="text-sm font-bold text-on-surface">{headerAccount.label}</span>
            {headerAccount.hint ? (
              <span className="text-xs font-medium uppercase tracking-wide text-on-surface-variant">{headerAccount.hint}</span>
            ) : null}
            <span className="ml-1 flex items-center gap-1 rounded-full bg-secondary/15 px-2 py-0.5 text-xs font-bold text-secondary">
              <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
              {t("dashboard.profileActive")}
            </span>
          </div>
        );
      })() : null}
      <div className="relative z-10 flex flex-col items-center gap-3 sm:gap-4 md:flex-row">
        <motion.div
          className="relative shrink-0"
          whileHover={{ scale: 1.02 }}
          transition={{ type: "spring", stiffness: 400, damping: 22 }}
        >
          <div className={`rounded-full bg-gradient-to-tr ${gradientClass} p-1 shadow-lg shadow-primary/20`}>
            <div className="h-full w-full overflow-hidden rounded-full border-4 border-surface-container-low">
              {/* eslint-disable-next-line @next/next/no-img-element -- remote API or demo asset */}
              <img
                alt=""
                className="h-20 w-20 object-cover sm:h-24 sm:w-24"
                height={128}
                src={avatarSrc}
                width={128}
              />
            </div>
          </div>
          {showVerified ? (
            <div className="absolute bottom-1 right-1 rounded-full bg-primary-container p-1 text-on-primary-container shadow-lg">
              <span
                className="material-symbols-outlined text-sm"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                verified
              </span>
            </div>
          ) : null}
        </motion.div>
        <div className="min-w-0 flex-1 text-center md:text-left">
          <div className="mb-4 flex flex-col gap-4 md:flex-row md:items-center">
            <div className="min-w-0">
              <h1 className="text-lg font-bold tracking-tight text-on-surface sm:text-xl">
                {primaryLine}
              </h1>
              {secondaryLine ? (
                <p className="mt-1 text-sm font-medium text-on-surface-variant">
                  {secondaryLine}
                </p>
              ) : null}
            </div>
            {visitUrl ? (
              <motion.a
                href={visitUrl}
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
                className="inline-flex w-full shrink-0 rounded-xl bg-primary-container px-5 py-2 text-sm font-bold text-on-primary-container shadow-md shadow-primary/25 transition-colors hover:opacity-95 motion-reduce:transform-none sm:w-auto sm:px-6 sm:py-2.5"
              >
                {t("dashboard.profileVisit")}
              </motion.a>
            ) : (
              <button
                type="button"
                disabled
                className="shrink-0 rounded-lg bg-primary-container/50 px-6 py-2 text-sm font-bold text-on-primary-container/80"
              >
                {t("dashboard.profileVisit")}
              </button>
            )}
          </div>
          <div className="flex flex-wrap justify-center gap-x-8 gap-y-2 text-on-surface-variant md:justify-start">
            {stats.map((s, i) => (
              <div key={`${s.label}-${i}`}>
                <span className="font-bold text-on-surface">{s.value}</span>{" "}
                {s.label}
              </div>
            ))}
          </div>
          {platformTag ? (
            <p className="mt-2 text-xs font-medium uppercase tracking-wider text-on-surface-variant/80">
              {platformTag}
            </p>
          ) : null}
          <p className="mt-4 max-w-lg break-words text-sm leading-relaxed text-on-surface-variant" style={{ overflowWrap: "anywhere" }}>
            {bio}
          </p>
        </div>
      </div>
    </motion.header>
  );
}

