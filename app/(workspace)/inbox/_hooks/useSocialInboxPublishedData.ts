"use client";

import type { ContentManagerPost } from "@/app/(workspace)/content-manager/_types/contentManagerTypes";

import { useInboxPublishedPostsFromCache } from "./useInboxPublishedPostsFromCache";

export function useSocialInboxPublishedData(): {
  publishedPosts: ContentManagerPost[];
  listError: string | null;
  needsPublishedPostsApiHydration: boolean;
} {
  const { publishedPosts, error, needsPublishedPostsApiHydration } =
    useInboxPublishedPostsFromCache();

  return {
    publishedPosts,
    listError: error,
    needsPublishedPostsApiHydration,
  };
}
