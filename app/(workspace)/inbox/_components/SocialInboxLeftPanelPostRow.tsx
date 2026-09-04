"use client";

import { motion } from "framer-motion";
import { type ReactElement } from "react";

import type { ContentManagerPost } from "@/app/(workspace)/content-manager/_types/contentManagerTypes";
import { useTranslations } from "@/lib/i18n/WorkspaceLocaleProvider";

function snippetFromPost(post: ContentManagerPost): string {
  const raw = post.body?.trim() ?? "";
  if (raw.length <= 120) {
    return raw;
  }
  return `${raw.slice(0, 117)}…`;
}

function metricsLabel(
  post: ContentManagerPost,
  t: (key: string, vars?: Record<string, string | number>) => string,
): string {
  if (!post.metrics) {
    return t("inbox.postPublished");
  }
  if (post.channel === "wordpress") {
    return t("inbox.postMetrics", {
      likes: "—",
      comments: post.metrics.comments,
    });
  }
  return t("inbox.postMetrics", {
    likes: post.metrics.likes,
    comments: post.metrics.comments,
  });
}

interface SocialInboxLeftPanelPostRowProps {
  readonly post: ContentManagerPost;
  readonly active: boolean;
  readonly onSelect: (id: string) => void;
  readonly onClear: () => void;
}

export function SocialInboxLeftPanelPostRow({
  post,
  active,
  onSelect,
  onClear,
}: SocialInboxLeftPanelPostRowProps): ReactElement {
  const { t } = useTranslations();

  return (
    <div className="px-2 pb-1">
      <motion.div
        role="button"
        tabIndex={0}
        layout
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
        transition={{ type: "spring", stiffness: 520, damping: 35 }}
        onClick={() => {
          onSelect(post.id);
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onSelect(post.id);
          }
        }}
        className={`group relative cursor-pointer overflow-hidden rounded-2xl border text-left transition-shadow motion-reduce:transform-none ${
          active
            ? "border-primary/40 bg-gradient-to-br from-primary-container/25 via-surface-container-low/90 to-surface-container/80 shadow-[0_0_24px_-4px_rgba(107,73,216,0.45)] ring-1 ring-primary/20"
            : "border-outline-variant/10 bg-surface-container-low/40 hover:border-secondary/40 hover:bg-secondary/10 hover:shadow-md"
        }`}
      >
        {active ? (
          <div className="absolute bottom-2 left-0 top-2 w-1 rounded-full bg-gradient-to-b from-primary to-secondary shadow-[0_0_12px_rgba(204,190,255,0.6)]" />
        ) : null}
        <div className="relative flex gap-3 p-3 pl-4">
          <motion.div
            className={`relative h-11 w-11 shrink-0 overflow-hidden rounded-xl ring-2 ring-black/20 ${
              active ? "ring-primary/50" : "ring-white/5 group-hover:ring-primary/25"
            }`}
            whileHover={{ rotate: active ? 0 : -1.5 }}
            transition={{ type: "spring", stiffness: 400, damping: 22 }}
          >
            {post.imageUrl ? (
              <img
                alt=""
                className="h-full w-full object-cover"
                src={post.imageUrl}
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-surface-container-high">
                <span className="material-symbols-outlined text-2xl text-outline-variant/45">
                  image
                </span>
              </div>
            )}
          </motion.div>
          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-2">
              <span
                className={`truncate text-xs font-bold ${
                  active ? "text-on-primary-container" : "text-on-surface"
                }`}
              >
                {post.handle}
              </span>
              {active ? (
                <button
                  type="button"
                  className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-primary/25 bg-primary/10 text-primary transition-colors hover:border-primary/45 hover:bg-primary/20"
                  title={t("inbox.postsClearSelection")}
                  aria-label={t("inbox.postsClearSelection")}
                  onClick={(e) => {
                    e.stopPropagation();
                    onClear();
                  }}
                >
                  <span className="material-symbols-outlined text-sm" aria-hidden>
                    close
                  </span>
                </button>
              ) : null}
            </div>
            <p
              className={`mt-1 line-clamp-2 text-[11px] leading-snug ${
                active ? "text-on-surface-variant" : "text-on-surface-variant/90"
              }`}
            >
              {snippetFromPost(post)}
            </p>
            <div className="mt-2 flex items-center gap-2">
              <span
                className={`text-[10px] font-bold ${
                  active ? "text-secondary" : "text-on-surface-variant"
                }`}
              >
                {metricsLabel(post, t)}
              </span>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
