"use client";

import { useState, type ReactElement } from "react";

import { WorkspacePageContainer } from "../../../_components/WorkspacePageContainer";
import { useWordPressBlogs } from "../_hooks/useWordPressBlogs";
import { WordPressBlogList } from "./WordPressBlogList";
import { WordPressBlogReader } from "./WordPressBlogReader";
import { buildWordPressMediaMap, featuredMediaUrlForPost } from "@/lib/social/wordpressBlogMedia";

export function WordPressBlogsScreen({ embedded = false }: { embedded?: boolean } = {}): ReactElement {
  const [view, setView] = useState<"list" | "reader">("list");
  const {
    posts,
    media,
    selectedPost,
    loading,
    refreshing,
    error,
    selectPost,
    refresh,
  } = useWordPressBlogs();

  const mediaById = buildWordPressMediaMap(media);
  const selectedImageUrl = selectedPost ? featuredMediaUrlForPost(selectedPost, mediaById) : null;

  const openReader = (postId: string): void => {
    selectPost(postId);
    setView("reader");
  };

  const content = (
    <div className="flex w-full flex-col gap-6">
        <header className="flex flex-wrap items-center justify-between gap-3 border-b border-outline-variant/20 pb-4">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-bold">
              WordPress Blogs
            </h1>
            {view !== "list" ? (
              <button
                type="button"
                onClick={() => setView("list")}
                className="rounded-lg border border-secondary/45 px-3 py-1 text-sm font-semibold text-secondary hover:bg-secondary/10"
              >
                All Blogs
              </button>
            ) : null}
          </div>
          <button
            type="button"
            onClick={() => void refresh(true)}
            disabled={refreshing}
            className="flex h-9 items-center gap-2 rounded-lg border border-outline-variant/40 px-3 text-sm font-semibold text-on-surface-variant hover:border-secondary/50 hover:text-secondary disabled:opacity-60"
          >
            <span className="material-symbols-outlined text-[19px]">
              {refreshing ? "progress_activity" : "sync"}
            </span>
            {refreshing ? "Refreshing" : "Sync WordPress"}
          </button>
        </header>

        {error ? (
          <div className="rounded-lg border border-error/30 bg-error/10 px-4 py-3 text-sm text-error">
            {error}
          </div>
        ) : null}

        {view === "list" ? (
          <section className="rounded-lg border border-outline-variant/20 bg-surface-container-low px-5 py-7 sm:px-8">
            <h2 className="text-3xl font-bold tracking-normal text-on-surface">
              Latest Insights
            </h2>
            <div className="mt-7">
              <WordPressBlogList
                posts={posts}
                media={media}
                loading={loading}
                onOpen={openReader}
              />
            </div>
          </section>
        ) : null}

        {view === "reader" && selectedPost ? (
          <WordPressBlogReader
            post={selectedPost}
            imageUrl={selectedImageUrl}
            onBack={() => setView("list")}
          />
        ) : null}
    </div>
  );

  if (embedded) return content;

  return (
    <WorkspacePageContainer className="min-h-screen bg-surface px-4 py-5 text-on-surface sm:px-6 lg:px-8">
      {content}
    </WorkspacePageContainer>
  );
}
