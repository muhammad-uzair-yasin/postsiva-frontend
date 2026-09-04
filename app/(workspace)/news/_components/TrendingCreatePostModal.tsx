"use client";

import { useEffect, useState } from "react";

import { useWorkspaceComposerModal } from "@/app/(workspace)/_components/WorkspaceComposerModalProvider";
import { useWorkspaceHeaderAccounts } from "@/app/(workspace)/_components/WorkspaceHeaderAccountsProvider";
import { getStoredActiveWorkspaceId } from "@/lib/auth/session";
import { mediaFromArticleImageUrl } from "@/lib/news/newsArticleComposerHandoff";
import {
  platformLabel,
  type TrendingPostItem,
} from "@/lib/news/trendingApi";
import { setTrendingComposerHandoff } from "@/lib/news/trendingComposerHandoff";
import {
  emptyComposerSessionCacheSnapshot,
  saveComposerSessionCache,
} from "@/lib/post-composer/composerSessionCache";
import { SocialPlatformIcon } from "@/lib/social/SocialPlatformIcon";
import { isSocialPlatformIconId } from "@/lib/social/socialPlatformIconSrc";

interface TrendingCreatePostModalProps {
  post: TrendingPostItem;
  onClose: () => void;
}

export function TrendingCreatePostModal({
  post,
  onClose,
}: TrendingCreatePostModalProps): React.ReactElement {
  const { openComposer } = useWorkspaceComposerModal();
  const { accounts } = useWorkspaceHeaderAccounts();

  const [selectedAccountId, setSelectedAccountId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!selectedAccountId && accounts.length > 0) {
      const first = accounts.find((a) => !a.disabled && a.id !== "all");
      if (first) setSelectedAccountId(first.id);
    }
  }, [accounts, selectedAccountId]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  const selectedAccount = accounts.find((a) => a.id === selectedAccountId) ?? null;
  const selectableAccounts = accounts.filter((a) => !a.disabled && a.id !== "all");

  function handleCreate() {
    if (!selectedAccount) return;
    setError(null);

    const platform = (selectedAccount.iconId ?? "instagram").toLowerCase();
    const workspaceId = getStoredActiveWorkspaceId();
    // Image URL only (YouTube = thumbnail; no video download)
    const media = mediaFromArticleImageUrl(post.image);

    setTrendingComposerHandoff({
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      post_url: post.url,
      post_title: post.title,
      post_snippet: post.snippet ?? null,
      post_image: post.image ?? null,
      source_platform: post.platform,
      author: post.source ?? null,
      view_count: post.view_count ?? null,
      like_count: post.like_count ?? null,
      comment_count: post.comment_count ?? null,
      share_count: post.share_count ?? null,
      accountId: selectedAccount.id,
      platform,
      account_name: selectedAccount.label ?? null,
    });

    saveComposerSessionCache(workspaceId, {
      ...emptyComposerSessionCacheSnapshot(),
      selectedIds: [selectedAccount.id],
      activeChannelId: selectedAccount.id,
      unifiedMedia: media,
    });

    onClose();
    openComposer();
  }

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />

      <div
        className="relative z-10 w-full max-w-2xl overflow-hidden rounded-2xl border border-outline-variant/20 bg-surface shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-outline-variant/10 px-6 py-4">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-xl text-primary">
              auto_awesome
            </span>
            <h2 className="text-base font-semibold text-on-surface">Create Post</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full text-on-surface-variant transition hover:bg-surface-container hover:text-on-surface"
          >
            <span className="material-symbols-outlined text-base">close</span>
          </button>
        </div>

        <div className="border-b border-outline-variant/10 bg-surface-container-low px-6 py-3">
          <p className="line-clamp-2 text-sm font-medium text-on-surface">
            {post.title}
          </p>
          <p className="mt-0.5 text-xs text-primary">
            {post.source ?? platformLabel(post.platform)}
            <span className="text-on-surface-variant">
              {" "}
              · {platformLabel(post.platform)}
            </span>
          </p>
          <p className="mt-1 text-[11px] text-on-surface-variant">
            Opens the post composer and drafts a caption inspired by this trending
            post.
          </p>
        </div>

        <div className="px-6 py-5">
          <p className="mb-4 text-xs font-semibold uppercase tracking-wide text-on-surface-variant">
            Select Account
          </p>

          {selectableAccounts.length === 0 ? (
            <p className="rounded-xl border border-outline-variant/20 bg-surface-container-low px-4 py-3 text-sm text-on-surface-variant">
              No connected accounts. Connect a social account in Settings first.
            </p>
          ) : (
            <div className="grid grid-cols-4 gap-3 sm:grid-cols-5">
              {selectableAccounts.map((account) => {
                const iconId = isSocialPlatformIconId(account.iconId ?? "")
                  ? account.iconId!
                  : "instagram";
                const isSelected = account.id === selectedAccountId;
                return (
                  <button
                    key={account.id}
                    type="button"
                    onClick={() => setSelectedAccountId(account.id)}
                    className={`relative flex flex-col items-center gap-2 rounded-xl border p-3 text-center transition ${
                      isSelected
                        ? "border-primary/50 bg-primary/10 ring-1 ring-primary/30"
                        : "border-outline-variant/15 bg-surface-container-low hover:border-outline-variant/30 hover:bg-surface-container"
                    }`}
                  >
                    {isSelected ? (
                      <span className="absolute right-1.5 top-1.5 material-symbols-outlined text-[14px] text-primary">
                        check_circle
                      </span>
                    ) : null}
                    <SocialPlatformIcon
                      platform={iconId}
                      className="h-10 w-10 rounded-xl"
                      alt=""
                    />
                    <p className="w-full truncate text-[10px] font-medium leading-tight text-on-surface">
                      {account.label}
                    </p>
                    <p className="text-[9px] capitalize text-on-surface-variant">
                      {account.iconId ?? "social"}
                    </p>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {error ? (
          <div className="mx-6 mb-3 rounded-xl border border-error/20 bg-error/10 px-4 py-2.5 text-xs text-error">
            {error}
          </div>
        ) : null}

        <div className="flex gap-3 border-t border-outline-variant/10 px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-xl border border-outline-variant/20 bg-surface-container-low px-4 py-2.5 text-sm font-medium text-on-surface-variant transition hover:bg-surface-container"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleCreate}
            disabled={!selectedAccount}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-on-primary transition hover:opacity-90 disabled:opacity-50"
          >
            <span className="material-symbols-outlined text-base">edit_note</span>
            Open composer
          </button>
        </div>
      </div>
    </div>
  );
}
