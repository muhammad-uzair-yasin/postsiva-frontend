"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { usePathname } from "next/navigation";
import { useTranslations } from "@/lib/i18n/WorkspaceLocaleProvider";
import { useWorkspaceComposerModal } from "../../_components/WorkspaceComposerModalProvider";
import { useWorkspaceLayout } from "../../_context/WorkspaceLayoutContext";

import {
  itemMotionClass,
  WorkspaceDashboardNavLink,
} from "./WorkspaceDashboardNavLink";

const containerVariants = {
  hidden: { opacity: 0, y: 18, scale: 0.98 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 320,
      damping: 28,
      staggerChildren: 0.055,
      delayChildren: 0.04,
    },
  },
} as const;

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  show: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 400, damping: 30 },
  },
} as const;

export function WorkspaceDashboardBottomNav(): React.ReactElement | null {
  const { t } = useTranslations();
  const pathname = usePathname();
  const { openComposer } = useWorkspaceComposerModal();
  const { layoutMode } = useWorkspaceLayout();
  const reduceMotion = useReducedMotion();
  const isDashboard = pathname === "/dashboard";
  const isContentManager =
    pathname === "/content-manager" ||
    pathname.startsWith("/content-manager/");
  const isInbox = pathname === "/inbox" || pathname.startsWith("/inbox/");
  const isSettings =
    pathname === "/settings" || pathname.startsWith("/settings/");
  const isComposer = pathname === "/post-scheduler";

  // Hide bottom nav when sidebar is active
  if (layoutMode === "sidebar") {
    return null;
  }

  const motionProps = reduceMotion
    ? { initial: false, animate: { opacity: 1, y: 0 } }
    : {
        initial: "hidden" as const,
        animate: "show" as const,
        variants: containerVariants,
      };

  return (
    <div className="fixed bottom-5 left-1/2 z-50 -translate-x-1/2 sm:bottom-7">
      <motion.nav
        {...motionProps}
        className="nav-pill-glow flex min-w-[min(100vw-1rem,580px)] items-center justify-between gap-1.5 rounded-full border border-outline-variant/20 bg-surface-container-high/95 px-3.5 py-3 shadow-2xl backdrop-blur-xl sm:min-w-[min(100vw-2rem,640px)] sm:gap-2 sm:px-4 sm:py-3.5 md:min-w-[min(100vw-2rem,700px)] md:gap-2 md:px-5 lg:min-w-[min(100vw-2rem,800px)]"
        aria-label={t("nav.mainAria")}
      >
        <motion.div variants={reduceMotion ? undefined : itemVariants}>
          <WorkspaceDashboardNavLink
            href="/dashboard"
            icon="space_dashboard"
            label={t("nav.dashboard")}
            active={isDashboard}
            labelClassName="text-[11px] tracking-wide sm:text-[12px] sm:tracking-wider"
          />
        </motion.div>
        <motion.div variants={reduceMotion ? undefined : itemVariants}>
          <WorkspaceDashboardNavLink
            href="/content-manager"
            icon="folder_managed"
            label={t("nav.content")}
            active={isContentManager}
            labelClassName="text-[11px] leading-tight tracking-tight sm:text-[12px] sm:tracking-wide"
          />
        </motion.div>
        <motion.div
          variants={reduceMotion ? undefined : itemVariants}
          className="relative -top-11 px-2 sm:-top-12 sm:px-2.5"
        >
          {isComposer ? (
            <motion.div
              whileTap={reduceMotion ? undefined : { scale: 0.94 }}
              whileHover={reduceMotion ? undefined : { scale: 1.04 }}
              transition={{ type: "spring", stiffness: 450, damping: 22 }}
            >
              <Link
                href="/post-scheduler"
                aria-current="page"
                className={`flex h-[4.75rem] w-[4.75rem] items-center justify-center rounded-full plus-button-glow sm:h-[5rem] sm:w-[5rem] ${itemMotionClass} motion-safe:hover:shadow-[0_10px_32px_rgba(204,190,255,0.45)] active:scale-95 bg-primary-container ring-2 ring-primary/40 ring-offset-[3px] ring-offset-surface-container-high`}
              >
                <span
                  className="material-symbols-outlined text-[2.75rem] font-bold text-on-primary-container sm:text-[3rem]"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  add
                </span>
              </Link>
            </motion.div>
          ) : (
            <motion.button
              type="button"
              onClick={() => {
                openComposer();
              }}
              aria-label={t("nav.createPost")}
              whileTap={reduceMotion ? undefined : { scale: 0.94 }}
              whileHover={reduceMotion ? undefined : { scale: 1.04 }}
              transition={{ type: "spring", stiffness: 450, damping: 22 }}
              className={`flex h-[4.75rem] w-[4.75rem] items-center justify-center rounded-full plus-button-glow sm:h-[5rem] sm:w-[5rem] ${itemMotionClass} motion-safe:hover:shadow-[0_12px_36px_rgba(204,190,255,0.5)] active:scale-95 bg-primary`}
            >
              <span className="material-symbols-outlined text-[2.75rem] font-bold text-on-primary sm:text-[3rem]">
                add
              </span>
            </motion.button>
          )}
        </motion.div>
        <motion.div variants={reduceMotion ? undefined : itemVariants}>
          <WorkspaceDashboardNavLink
            href="/inbox"
            icon="forum"
            label={t("nav.inbox")}
            active={isInbox}
            labelClassName="text-[11px] tracking-wide sm:text-[12px] sm:tracking-wider"
          />
        </motion.div>
        <motion.div variants={reduceMotion ? undefined : itemVariants}>
          <WorkspaceDashboardNavLink
            href="/settings"
            icon="settings"
            label={t("nav.settings")}
            active={isSettings}
            labelClassName="text-[11px] tracking-wide sm:text-[12px] sm:tracking-wider"
          />
        </motion.div>
      </motion.nav>
    </div>
  );
}
