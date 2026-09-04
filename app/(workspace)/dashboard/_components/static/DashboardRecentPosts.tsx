"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import type { ReactElement } from "react";

import { useTranslations } from "@/lib/i18n/WorkspaceLocaleProvider";
import {
  workspaceListContainer,
  workspaceListItem,
} from "@/lib/ui/workspaceMotionVariants";

import type { UseDashboardUnifiedPostsResult } from "../../_hooks/useDashboardUnifiedPosts";
import { DashboardRecentPostCard } from "./DashboardRecentPostCard";

function PostCardSkeleton(): ReactElement {
  return (
    <div className="overflow-hidden rounded-2xl border border-outline-variant/10">
      <div className="mb-3 aspect-square inbox-skeleton-shimmer" />
      <div className="h-4 w-3/4 rounded bg-on-surface/10 inbox-skeleton-shimmer" />
      <div className="mt-2 h-3 w-24 rounded bg-on-surface/10" />
    </div>
  );
}

interface DashboardRecentPostsProps {
  readonly postsState: UseDashboardUnifiedPostsResult;
}

export function DashboardRecentPosts({
  postsState,
}: DashboardRecentPostsProps): ReactElement {
  const { t } = useTranslations();
  const { posts, isLoading, error } = postsState;

  return (
    <section aria-label={t("dashboard.recentPostsTitle")}>
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <h2 className="text-2xl font-extrabold text-on-surface">
            {t("dashboard.recentPostsTitle")}
          </h2>
        <motion.div
          whileHover={{ scale: 1.03, x: 2 }}
          whileTap={{ scale: 0.98 }}
          className="inline-flex motion-reduce:transform-none"
        >
          <Link
            href="/content-manager?tab=published"
            className="flex items-center gap-1 rounded-xl border border-primary/25 bg-primary/10 px-3 py-2 text-sm font-bold text-primary transition-colors hover:border-primary/40 hover:bg-primary/15 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          >
            {t("dashboard.recentPostsViewMore")}{" "}
            <span className="material-symbols-outlined text-sm" aria-hidden>
              arrow_forward
            </span>
          </Link>
        </motion.div>
      </div>

      {error !== null ? (
        <p className="mb-6 rounded-lg border border-error/30 bg-error/5 px-4 py-3 text-sm text-error">
          {error}
        </p>
      ) : null}

      <motion.div
        className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-4"
        variants={workspaceListContainer}
        initial="hidden"
        animate="show"
      >
        {isLoading
          ? Array.from({ length: 4 }, (_, i) => (
              <motion.div key={`post-sk-${i}`} variants={workspaceListItem}>
                <PostCardSkeleton />
              </motion.div>
            ))
          : posts.length === 0
            ? (
                <motion.p
                  variants={workspaceListItem}
                  className="col-span-full rounded-2xl border border-dashed border-outline-variant/25 bg-surface-container-low/40 py-14 text-center text-sm text-on-surface-variant"
                >
                  {t("dashboard.recentPostsEmptyNone")}
                </motion.p>
              )
            : (
                posts.map((post) => (
                  <motion.div key={post.id} variants={workspaceListItem}>
                    <DashboardRecentPostCard post={post} />
                  </motion.div>
                ))
              )}
      </motion.div>
    </section>
  );
}
