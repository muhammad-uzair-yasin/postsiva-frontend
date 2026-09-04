"use client";

import { motion } from "framer-motion";
import { useMemo, useState, type ReactElement } from "react";

import { useTranslations } from "@/lib/i18n/WorkspaceLocaleProvider";
import type { ContentManagerPost } from "@/app/(workspace)/content-manager/_types/contentManagerTypes";

import { inboxListContainer, inboxListItem } from "./inboxMotionVariants";
import { SocialInboxLeftPanelPostRow } from "./SocialInboxLeftPanelPostRow";

const INITIAL_VISIBLE_COUNT = 10;
const LOAD_MORE_STEP = 10;

interface SocialInboxLeftPanelProps {
  readonly posts: ContentManagerPost[];
  readonly isLoading: boolean;
  readonly error: string | null;
  readonly selectedPostId: string | null;
  readonly onSelectPostId: (id: string) => void;
  readonly onClearSelectedPost: () => void;
  readonly onClose: () => void;
}

export function SocialInboxLeftPanel({
  posts,
  isLoading,
  error,
  selectedPostId,
  onSelectPostId,
  onClearSelectedPost,
  onClose,
}: SocialInboxLeftPanelProps): ReactElement {
  const { t } = useTranslations();
  const [visibleCount, setVisibleCount] = useState(INITIAL_VISIBLE_COUNT);

  const orderedPosts = useMemo(() => {
    if (!selectedPostId) {
      return posts;
    }
    const selectedPost = posts.find((post) => post.id === selectedPostId);
    if (!selectedPost) {
      return posts;
    }
    return [selectedPost, ...posts.filter((post) => post.id !== selectedPostId)];
  }, [posts, selectedPostId]);

  const visiblePosts = orderedPosts.slice(0, visibleCount);
  const hasMore = visibleCount < posts.length;

  return (
    <motion.div
      initial={{ opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ type: "spring", stiffness: 260, damping: 28 }}
      className="fixed inset-x-0 top-[4.5rem] z-20 flex max-h-[min(55dvh,calc(100dvh-8rem))] w-full shrink-0 flex-col overflow-hidden border-b border-outline-variant/10 bg-surface shadow-lg lg:static lg:z-auto lg:h-full lg:max-h-full lg:min-h-0 lg:w-[min(18rem,100%)] lg:max-w-[300px] lg:border-b-0 lg:border-r lg:shadow-none xl:w-[min(22rem,100%)] xl:max-w-[380px]"
    >
      <div className="flex min-h-0 flex-1 flex-col">
        <div className="flex shrink-0 items-center justify-between border-b border-outline-variant/10 px-4 py-2">
          <span className="text-[10px] font-extrabold uppercase tracking-[0.14em] text-on-surface-variant">{t("inbox.postsTitle")}</span>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface"
            title={t("inbox.postsHidePanel")}
          >
            <span className="material-symbols-outlined text-lg">close</span>
          </button>
        </div>
        <div className="workspace-dashboard-scroll min-h-0 flex-1 overflow-y-auto py-2">
          {error ? (
            <p className="p-6 text-center text-sm text-error" role="alert">
              {error}
            </p>
          ) : null}
          {!error && isLoading ? (
            <div className="space-y-3 p-4" aria-busy aria-label={t("inbox.postsLoading")}>
              {Array.from({ length: 5 }, (_, i) => (
                <div
                  key={`sk-${i}`}
                  className="h-[5.25rem] rounded-2xl bg-gradient-to-r from-surface-container-high/40 via-surface-container-high/70 to-surface-container-high/40 inbox-skeleton-shimmer"
                />
              ))}
            </div>
          ) : null}
          {!error && !isLoading && posts.length === 0 ? (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="p-8 text-center text-sm leading-relaxed text-on-surface-variant"
            >
              {t("inbox.postsEmpty")}
            </motion.p>
          ) : null}
          {!error && !isLoading && posts.length > 0 ? (
            <motion.div
              className="flex flex-col"
              variants={inboxListContainer}
              initial="hidden"
              animate="show"
              key={posts[0]?.id ?? "list"}
            >
              {visiblePosts.map((post) => (
                <motion.div key={post.id} variants={inboxListItem}>
                  <SocialInboxLeftPanelPostRow
                    post={post}
                    active={post.id === selectedPostId}
                    onSelect={onSelectPostId}
                    onClear={onClearSelectedPost}
                  />
                </motion.div>
              ))}
            </motion.div>
          ) : null}
          {!error && !isLoading && hasMore ? (
            <div className="border-t border-outline-variant/10 px-3 pb-3 pt-2">
              <motion.button
                type="button"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  setVisibleCount((c) =>
                    Math.min(c + LOAD_MORE_STEP, posts.length),
                  );
                }}
                className="flex w-full items-center justify-center gap-2 rounded-2xl border border-primary/25 bg-gradient-to-r from-surface-container-high to-surface-container py-3 text-xs font-bold text-primary shadow-sm transition-shadow hover:border-primary/40 hover:shadow-[0_8px_24px_-8px_rgba(107,73,216,0.4)] motion-reduce:transform-none"
              >
                <span className="material-symbols-outlined text-base">
                  expand_more
                </span>
                {t("inbox.postsLoadMore")}
              </motion.button>
            </div>
          ) : null}
        </div>
      </div>
    </motion.div>
  );
}
