"use client";

import { motion } from "framer-motion";
import type { ReactElement } from "react";

import type { DashboardRecentPostView } from "@/lib/dashboard/dashboardRecentPostTypes";

interface DashboardRecentPostCardProps {
  readonly post: DashboardRecentPostView;
}

export function DashboardRecentPostCard({
  post,
}: DashboardRecentPostCardProps): ReactElement {
  return (
    <motion.article
      className="group cursor-pointer"
      whileHover={{ y: -4 }}
      transition={{ type: "spring", stiffness: 380, damping: 26 }}
    >
      <div className="relative mb-3 aspect-square overflow-hidden rounded-2xl border border-outline-variant/10 bg-surface-container-highest shadow-md ring-1 ring-white/5 transition-shadow group-hover:border-primary/20 group-hover:shadow-lg motion-reduce:transform-none">
        {post.imageSrc !== null ? (
          // eslint-disable-next-line @next/next/no-img-element -- remote CDN thumbnails
          <img
            alt=""
            className="h-full w-full object-cover transition-transform duration-500 motion-safe:group-hover:scale-110"
            height={400}
            src={post.imageSrc}
            width={400}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <span className="material-symbols-outlined text-4xl text-on-surface-variant">
              image_not_supported
            </span>
          </div>
        )}
        <div className="absolute inset-0 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 bg-black/50 px-3 py-2 text-sm font-semibold text-white opacity-0 backdrop-blur-[2px] transition-opacity motion-safe:group-hover:opacity-100">
          <div className="flex items-center gap-1">
            <span
              className="material-symbols-outlined text-[18px]"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              favorite
            </span>
            {post.likesLabel}
          </div>
          <div className="flex items-center gap-1">
            <span
              className="material-symbols-outlined text-[18px]"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              chat_bubble
            </span>
            {post.commentsLabel}
          </div>
          <div className="flex items-center gap-1">
            <span className="material-symbols-outlined text-[18px]">
              visibility
            </span>
            {post.reachLabel}
          </div>
        </div>
        {post.mediaTypeBadge !== null ? (
          <div className="absolute right-3 top-3 rounded-lg bg-black/55 px-2 py-1 text-[10px] font-bold uppercase tracking-widest text-white backdrop-blur-md">
            {post.mediaTypeBadge}
          </div>
        ) : null}
      </div>
      <div className="min-w-0">
        <p className="line-clamp-2 text-sm font-bold leading-snug text-on-surface">
          {post.caption}
        </p>
        <p className="mt-1 text-xs text-on-surface-variant">{post.dateLabel}</p>
      </div>
    </motion.article>
  );
}
