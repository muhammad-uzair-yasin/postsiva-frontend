"use client";

import { useCallback } from "react";

import type { ContentManagerPost } from "../_types/contentManagerTypes";
import { mergePublishedPostsById } from "../_utils/mergePublishedPostsById";

export function useMergePublishedPosts(
  setPosts: React.Dispatch<React.SetStateAction<ContentManagerPost[]>>,
): (incoming: ContentManagerPost[]) => void {
  return useCallback(
    (incoming: ContentManagerPost[]) => {
      setPosts((prev) => mergePublishedPostsById(prev, incoming));
    },
    [setPosts],
  );
}
