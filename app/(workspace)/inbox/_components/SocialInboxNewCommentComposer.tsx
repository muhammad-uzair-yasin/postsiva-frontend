"use client";

import { motion } from "framer-motion";
import { useCallback, useState, type ReactElement } from "react";
import { createPortal } from "react-dom";

import { useWorkspaceHeaderAccounts } from "@/app/(workspace)/_components/WorkspaceHeaderAccountsProvider";
import type { ContentManagerPost } from "@/app/(workspace)/content-manager/_types/contentManagerTypes";
import {
  getStoredAccessToken,
  getStoredActiveWorkspaceId,
} from "@/lib/auth/session";
import { useTranslations } from "@/lib/i18n/WorkspaceLocaleProvider";
import { inboxPageOrgFromSelectedAccount } from "@/lib/inbox/inboxCommentsByPost";
import { createUnifiedComment } from "@/lib/social/unifiedCommentCreateApi";

interface SocialInboxNewCommentComposerProps {
  readonly post: ContentManagerPost;
  readonly onPosted: () => void;
}

/** Top-level comment box for the selected post/video. */
export function SocialInboxNewCommentComposer({
  post,
  onPosted,
}: SocialInboxNewCommentComposerProps): ReactElement | null {
  const { t } = useTranslations();
  const { selectedAccountId } = useWorkspaceHeaderAccounts();
  const [draft, setDraft] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const runSend = useCallback(async () => {
    const text = draft.trim();
    if (!text) {
      return;
    }
    const token = getStoredAccessToken();
    const ws = getStoredActiveWorkspaceId();
    if (!token?.trim() || !ws?.trim()) {
      setError(t("inbox.moderateNotSignedIn"));
      return;
    }
    setError(null);
    setIsSending(true);
    try {
      const { pageId, youtubeChannelId } = inboxPageOrgFromSelectedAccount(
        selectedAccountId,
        post.channel,
      );
      await createUnifiedComment(token, ws, {
        platform: post.channel,
        postId: post.id,
        text,
        pageId: pageId ?? post.pageId,
        youtubeChannelId: youtubeChannelId ?? post.youtubeChannelId,
        organizationId: post.organizationId,
      });
      setDraft("");
      setConfirmOpen(false);
      onPosted();
    } catch (e) {
      setError(
        e instanceof Error ? e.message : t("inbox.newCommentFailed"),
      );
    } finally {
      setIsSending(false);
    }
  }, [draft, onPosted, post, selectedAccountId, t]);

  if (
    ![
      "facebook",
      "youtube",
      "instagram",
      "tiktok",
      "linkedin",
      "threads",
      "bluesky",
      "mastodon",
      "wordpress",
    ].includes(post.channel)
  ) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border border-primary/20 bg-surface-container-low/60 p-3 shadow-sm backdrop-blur-md"
    >
      <p className="mb-2 flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-[0.14em] text-on-surface-variant">
        <span className="material-symbols-outlined text-[16px] text-primary">
          add_comment
        </span>
        {t("inbox.newCommentTitle")}
      </p>
      <div className="rounded-xl border border-outline-variant/25 bg-surface-container-lowest p-2.5 transition-colors focus-within:border-primary/50">
        <textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder={t("inbox.newCommentPlaceholder")}
          rows={2}
          disabled={isSending}
          className="w-full resize-none border-none bg-transparent text-sm text-on-surface outline-none placeholder:text-outline/40 focus:outline-none focus:ring-0 focus-visible:outline-none disabled:opacity-60"
        />
        <div className="mt-1.5 flex items-center justify-between gap-3 border-t border-outline-variant/10 pt-2">
          {error ? (
            <p className="min-w-0 flex-1 truncate text-xs text-error" role="alert">
              {error}
            </p>
          ) : (
            <span />
          )}
          <motion.button
            type="button"
            disabled={isSending || draft.trim().length === 0}
            whileHover={{ scale: isSending ? 1 : 1.03 }}
            whileTap={{ scale: isSending ? 1 : 0.97 }}
            onClick={() => {
              setConfirmOpen(true);
            }}
            className="inline-flex shrink-0 items-center gap-2 rounded-lg bg-primary-container px-4 py-1.5 text-xs font-bold text-on-primary-container shadow-md transition-all disabled:cursor-not-allowed disabled:opacity-50 motion-reduce:transform-none"
          >
            <span>
              {isSending
                ? t("inbox.newCommentSending")
                : t("inbox.newCommentSend")}
            </span>
            <span
              className="material-symbols-outlined text-sm"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              send
            </span>
          </motion.button>
        </div>
      </div>
      {confirmOpen && typeof document !== "undefined"
        ? createPortal(
            <div
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
              role="dialog"
              aria-modal="true"
              onClick={() => {
                if (!isSending) setConfirmOpen(false);
              }}
            >
              <div
                className="w-full max-w-sm rounded-2xl border border-outline-variant/20 bg-surface-container-high p-5 shadow-2xl"
                onClick={(e) => e.stopPropagation()}
              >
                <h3 className="text-sm font-bold text-on-surface">
                  {t("inbox.newCommentConfirmTitle")}
                </h3>
                <p className="mt-2 text-xs leading-relaxed text-on-surface-variant">
                  {t("inbox.newCommentConfirmBody")}
                </p>
                <div className="mt-4 flex justify-end gap-2">
                  <button
                    type="button"
                    className="rounded-lg px-3 py-2 text-xs font-bold text-on-surface-variant transition-colors hover:bg-surface-container-highest"
                    disabled={isSending}
                    onClick={() => setConfirmOpen(false)}
                  >
                    {t("common.cancel")}
                  </button>
                  <button
                    type="button"
                    className="rounded-lg bg-primary px-3 py-2 text-xs font-bold text-on-primary transition-colors hover:opacity-90 disabled:opacity-40"
                    disabled={isSending}
                    onClick={() => {
                      void runSend();
                    }}
                  >
                    {isSending ? t("inbox.newCommentSending") : t("inbox.newCommentSend")}
                  </button>
                </div>
              </div>
            </div>,
            document.body,
          )
        : null}
    </motion.div>
  );
}
