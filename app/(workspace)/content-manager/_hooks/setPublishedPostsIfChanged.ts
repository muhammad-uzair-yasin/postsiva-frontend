import type { Dispatch, SetStateAction } from "react";

import { arePublishedPostListsSameById } from "@/lib/contentManager/publishedPostsWorkspaceCache";

import type { ContentManagerPost } from "../_types/contentManagerTypes";

/** Avoid re-render storms: keep previous array ref when ids match. */
export function setPublishedPostsIfChanged(
  setPosts: Dispatch<SetStateAction<ContentManagerPost[]>>,
  next: ContentManagerPost[],
): void {
  setPosts((prev) =>
    arePublishedPostListsSameById(prev, next) ? prev : next,
  );
}

/** Clear posts without allocating a new [] when already empty. */
export function clearPublishedPostsIfNeeded(
  setPosts: Dispatch<SetStateAction<ContentManagerPost[]>>,
): void {
  setPosts((prev) => (prev.length === 0 ? prev : []));
}
