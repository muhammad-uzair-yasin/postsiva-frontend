"use client";

import { useCallback, useState, type MouseEvent } from "react";
import { createPortal } from "react-dom";

import { useWorkspaceHeaderAccounts } from "@/app/(workspace)/_components/WorkspaceHeaderAccountsProvider";
import {
  getStoredAccessToken,
  getStoredActiveWorkspaceId,
} from "@/lib/auth/session";
import { formatUserFacingApiError } from "@/lib/api/formatUserFacingApiError";
import { resolveInboxModerateErrorMessage } from "@/lib/inbox/facebookModerationErrors";
import { inboxCommentModerationUiEnabled } from "@/lib/inbox/inboxCommentModerationUi";
import { inboxCommentDeleteAllowed } from "@/lib/inbox/inboxCommentDeleteEligibility";
import { inboxPageOrgFromSelectedAccount } from "@/lib/inbox/inboxCommentsByPost";
import { useTranslations } from "@/lib/i18n/WorkspaceLocaleProvider";
import type { UnifiedInboxMessage } from "@/lib/inbox/unifiedInboxTypes";
import {
  moderateUnifiedComment,
  type UnifiedModerateAction,
} from "@/lib/social/unifiedCommentModerationApi";
import {
  reactUnifiedComment,
  type UnifiedReactAction,
} from "@/lib/social/unifiedCommentReactionApi";

import { SocialInboxCommentIconButton } from "./SocialInboxCommentIconButton";

interface SocialInboxCommentActionsProps {
  readonly comment: UnifiedInboxMessage;
  readonly mode?: "moderation" | "reaction" | "all";
  readonly appearance?: "default" | "icon";
  readonly onModerated: (
    message: UnifiedInboxMessage,
    action: UnifiedModerateAction,
  ) => Promise<void> | void;
  readonly moderationLocked?: boolean;
}

type ConfirmTarget = UnifiedModerateAction | UnifiedReactAction | "open-facebook";

function supportedActionsForPlatform(
  platform: UnifiedInboxMessage["platform"],
): ReadonlySet<UnifiedModerateAction> {
  if (platform === "instagram" || platform === "tiktok") {
    return new Set(["hide", "unhide", "delete"]);
  }
  if (platform === "linkedin") {
    return new Set(["delete"]);
  }
  if (platform === "threads") {
    return new Set(["hide", "unhide"]);
  }
  if (platform === "bluesky" || platform === "mastodon") {
    return new Set(["block"]);
  }
  if (platform === "wordpress") {
    // WordPress has a real spam state; hide/unhide and block do not apply.
    return new Set(["spam", "unspam", "delete"]);
  }
  return new Set(["hide", "unhide", "delete", "block"]);
}

function ModerationActionButton({
  iconOnly,
  icon,
  label,
  title,
  disabled,
  destructive = false,
  onClick,
  textBusy,
  textIdle,
  btnClassDefault,
  iconClass,
}: {
  readonly iconOnly: boolean;
  readonly icon: string;
  readonly label: string;
  readonly title: string;
  readonly disabled: boolean;
  readonly destructive?: boolean;
  readonly onClick: (e: MouseEvent<HTMLButtonElement>) => void;
  readonly textBusy: string | null;
  readonly textIdle: string;
  readonly btnClassDefault: string;
  readonly iconClass: string;
}): React.ReactElement {
  if (iconOnly) {
    return (
      <SocialInboxCommentIconButton
        icon={icon}
        label={label}
        title={title}
        disabled={disabled}
        variant={destructive ? "destructive" : "default"}
        onClick={onClick}
      />
    );
  }

  const toneClass = destructive
    ? "text-on-surface-variant hover:bg-error/10 hover:text-error"
    : "text-on-surface-variant hover:bg-primary/10 hover:text-primary";

  return (
    <button
      type="button"
      className={`${btnClassDefault} ${toneClass} disabled:opacity-40`}
      disabled={disabled}
      aria-label={title}
      onClick={onClick}
    >
      <span className={`material-symbols-outlined ${iconClass}`}>{icon}</span>
      {textBusy ?? textIdle}
    </button>
  );
}

/** Hide / unhide / delete actions for supported platform comments. */
export function SocialInboxCommentActions({
  comment: c,
  mode = "all",
  appearance = "default",
  onModerated,
  moderationLocked = false,
}: SocialInboxCommentActionsProps): React.ReactElement | null {
  const { t } = useTranslations();
  if (!inboxCommentModerationUiEnabled(c.platform)) {
    return null;
  }
  const { selectedAccountId, unifiedProfiles } = useWorkspaceHeaderAccounts();
  const headerScope = inboxPageOrgFromSelectedAccount(selectedAccountId, c.platform);
  const [busyAction, setBusyAction] = useState<UnifiedModerateAction | null>(
    null,
  );
  const [busyReaction, setBusyReaction] =
    useState<UnifiedReactAction | null>(null);
  const [isHidden, setIsHidden] = useState<boolean>(c.isHidden ?? false);
  // WordPress carries its comment status in platform_meta; anything already in the
  // spam bucket should offer "Not spam" instead of "Spam".
  const [isSpam, setIsSpam] = useState<boolean>(
    ((c as { platformMeta?: { status?: unknown } }).platformMeta?.status ?? "") === "spam",
  );
  const [liked, setLiked] = useState(false);
  const [reactionId, setReactionId] = useState<string | null>(null);
  const [confirmTarget, setConfirmTarget] = useState<ConfirmTarget | null>(null);
  const [error, setError] = useState<string | null>(null);

  const postId = c.sourcePostId?.trim() ?? "";
  const commentId = c.sourceCommentId?.trim() ?? "";
  const pageId =
    c.sourcePageId?.trim() || headerScope.pageId?.trim() || "";
  const youtubeChannelId =
    c.sourceYoutubeChannelId?.trim() ||
    headerScope.youtubeChannelId?.trim() ||
    "";
  const authorId = c.sourceAuthorId?.trim() ?? "";
  const commentUrn = c.sourceCommentUrn?.trim() ?? "";
  const commentCid = c.sourceCommentCid?.trim() ?? "";
  const permalinkUrl = c.sourcePermalinkUrl?.trim() ?? "";
  const organizationId =
    c.sourceOrganizationId?.trim() || headerScope.organizationId?.trim() || "";
  const actionSet = supportedActionsForPlatform(c.platform);
  const showDelete =
    actionSet.has("delete") &&
    inboxCommentDeleteAllowed({
      platform: c.platform,
      sourceAuthorId: authorId,
      sourceOrganizationId: organizationId,
      selectedAccountId,
      unifiedProfiles,
    });
  const supportsReaction =
    (c.platform === "facebook" && pageId.length > 0) ||
    c.platform === "tiktok" ||
    c.platform === "mastodon" ||
    (c.platform === "linkedin" && commentUrn.length > 0) ||
    (c.platform === "bluesky" && commentCid.length > 0);
  const showReactionButton =
    supportsReaction && !(c.platform === "bluesky" && liked && !reactionId);
  const supported =
    postId.length > 0 &&
    commentId.length > 0 &&
    ((c.platform === "facebook" && pageId.length > 0) ||
      c.platform !== "facebook");

  const runAction = useCallback(
    async (action: UnifiedModerateAction) => {
      setError(null);
      const token = getStoredAccessToken();
      const ws = getStoredActiveWorkspaceId();
      if (!token?.trim() || !ws?.trim()) {
        setError(t("inbox.moderateNotSignedIn"));
        return;
      }
      setBusyAction(action);
      try {
        const out = await moderateUnifiedComment(token, ws, {
          action,
          platform: c.platform,
          commentId,
          postId,
          pageId,
          youtubeChannelId,
          organizationId,
          authorId,
        });
        if (action === "hide" || action === "unhide") {
          setIsHidden(out.is_hidden ?? action === "hide");
          setConfirmTarget(null);
        }
        if (action === "spam" || action === "unspam") {
          setIsSpam(action === "spam");
          setConfirmTarget(null);
        }
        if (action === "delete") {
          setConfirmTarget(null);
        }
        if (action === "block") {
          setConfirmTarget(null);
        }
        await Promise.resolve(onModerated(c, action));
      } catch (e) {
        const raw = e instanceof Error ? e.message : t("inbox.moderateFailed");
        setError(
          resolveInboxModerateErrorMessage(
            c.platform,
            action,
            raw,
            () => t("inbox.moderateCannotHideOwn"),
          ),
        );
      } finally {
        setBusyAction(null);
      }
    },
    [
      authorId,
      c,
      commentId,
      headerScope.pageId,
      headerScope.youtubeChannelId,
      onModerated,
      organizationId,
      pageId,
      postId,
      t,
      youtubeChannelId,
    ],
  );

  const runReaction = useCallback(
    async (action: UnifiedReactAction) => {
      setError(null);
      const token = getStoredAccessToken();
      const ws = getStoredActiveWorkspaceId();
      if (!token?.trim() || !ws?.trim()) {
        setError(t("inbox.moderateNotSignedIn"));
        return;
      }
      setBusyReaction(action);
      try {
        const out = await reactUnifiedComment(token, ws, {
          action,
          platform: c.platform,
          commentId,
          postId,
          pageId,
          commentUrn,
          commentCid,
          reactionId: action === "unlike" ? (reactionId ?? undefined) : undefined,
          organizationId,
        });
        setLiked(out.liked ?? action === "like");
        setReactionId(out.reactionId ?? null);
        setConfirmTarget(null);
      } catch (e) {
        setError(
          formatUserFacingApiError(
            e instanceof Error ? e.message : t("inbox.moderateFailed"),
          ),
        );
      } finally {
        setBusyReaction(null);
      }
    },
    [
      c.platform,
      commentCid,
      commentId,
      commentUrn,
      organizationId,
      pageId,
      postId,
      reactionId,
      t,
    ],
  );

  const requestBlock = useCallback(() => {
    setError(null);
    setConfirmTarget(
      c.platform === "youtube" || authorId.length > 0
        ? "block"
        : "open-facebook",
    );
  }, [authorId, c.platform]);

  const confirmOpenFacebook = useCallback(() => {
    if (!permalinkUrl) {
      return;
    }
    window.open(permalinkUrl, "_blank", "noopener,noreferrer");
    setConfirmTarget(null);
  }, [permalinkUrl]);

  const blockConfirmBody =
    c.platform === "youtube"
      ? t("inbox.blockCommentConfirmBodyYoutube")
      : c.platform === "facebook"
        ? t("inbox.blockCommentConfirmBodyFacebook")
        : t("inbox.blockCommentConfirmBody");

  if (!supported || moderationLocked) {
    return null;
  }

  const iconOnly = appearance === "icon";
  const btnClass = iconOnly
    ? "flex h-8 w-8 items-center justify-center rounded-full text-on-surface-variant transition-colors hover:bg-primary/10 hover:text-primary disabled:opacity-40"
    : "flex items-center gap-1 rounded-md px-2 py-1 text-[10px] font-bold transition-colors";
  const iconClass = iconOnly ? "text-[18px]" : "text-[14px]";
  const showModerationActions = mode === "all" || mode === "moderation";
  const showReactionActions = mode === "all" || mode === "reaction";
  if (mode === "reaction" && !showReactionButton) {
    return null;
  }

  return (
    <>
      <div className={`flex min-w-0 flex-wrap items-center gap-1${iconOnly ? " justify-end" : ""}`}>
        {showModerationActions && actionSet.has(isHidden ? "unhide" : "hide") ? (
          <ModerationActionButton
            iconOnly={iconOnly}
            icon={isHidden ? "visibility" : "visibility_off"}
            label={isHidden ? t("inbox.unhideComment") : t("inbox.hideComment")}
            title={
              isHidden
                ? t("inbox.unhideCommentTitle")
                : t("inbox.hideCommentTitle")
            }
            disabled={busyAction != null}
            onClick={(e) => {
              e.stopPropagation();
              setError(null);
              setConfirmTarget(isHidden ? "unhide" : "hide");
            }}
            textBusy={
              busyAction === "hide" || busyAction === "unhide"
                ? t("inbox.moderateWorking")
                : null
            }
            textIdle={
              isHidden ? t("inbox.unhideComment") : t("inbox.hideComment")
            }
            btnClassDefault={btnClass}
            iconClass={iconClass}
          />
        ) : null}
        {showModerationActions &&
        actionSet.has(isSpam ? "unspam" : "spam") ? (
          <ModerationActionButton
            iconOnly={iconOnly}
            icon={isSpam ? "inbox" : "flag"}
            label={isSpam ? t("inbox.unspamComment") : t("inbox.spamComment")}
            title={
              isSpam ? t("inbox.unspamCommentTitle") : t("inbox.spamCommentTitle")
            }
            disabled={busyAction != null}
            destructive
            onClick={(e) => {
              e.stopPropagation();
              setError(null);
              setConfirmTarget(isSpam ? "unspam" : "spam");
            }}
            textBusy={
              busyAction === "spam" || busyAction === "unspam"
                ? t("inbox.moderateWorking")
                : null
            }
            textIdle={isSpam ? t("inbox.unspamComment") : t("inbox.spamComment")}
            btnClassDefault={btnClass}
            iconClass={iconClass}
          />
        ) : null}
        {showModerationActions &&
        actionSet.has("block") &&
        (c.platform === "youtube" ||
          authorId.length > 0 ||
          permalinkUrl.length > 0) ? (
          <ModerationActionButton
            iconOnly={iconOnly}
            icon="block"
            label={t("inbox.blockCommentAuthor")}
            title={
              authorId.length > 0 || c.platform === "youtube"
                ? t("inbox.blockCommentAuthorTitle")
                : t("inbox.openFacebookToBlockTitle")
            }
            disabled={busyAction != null}
            destructive
            onClick={(e) => {
              e.stopPropagation();
              requestBlock();
            }}
            textBusy={
              busyAction === "block"
                ? t("inbox.blockCommentBlocking")
                : null
            }
            textIdle={t("inbox.blockCommentAuthor")}
            btnClassDefault={btnClass}
            iconClass={iconClass}
          />
        ) : null}
        {showModerationActions && showDelete ? (
          <ModerationActionButton
            iconOnly={iconOnly}
            icon="delete"
            label={t("inbox.deleteComment")}
            title={t("inbox.deleteCommentTitle")}
            disabled={busyAction != null}
            destructive
            onClick={(e) => {
              e.stopPropagation();
              setError(null);
              setConfirmTarget("delete");
            }}
            textBusy={null}
            textIdle={t("inbox.deleteComment")}
            btnClassDefault={btnClass}
            iconClass={iconClass}
          />
        ) : null}
        {showReactionActions && showReactionButton ? (
          <ModerationActionButton
            iconOnly={iconOnly}
            icon={liked ? "thumb_down" : "thumb_up"}
            label={liked ? t("inbox.unlikeComment") : t("inbox.likeComment")}
            title={
              liked
                ? t("inbox.unlikeCommentTitle")
                : t("inbox.likeCommentTitle")
            }
            disabled={busyAction != null || busyReaction != null}
            onClick={(e) => {
              e.stopPropagation();
              setError(null);
              setConfirmTarget(liked ? "unlike" : "like");
            }}
            textBusy={
              busyReaction != null ? t("inbox.moderateWorking") : null
            }
            textIdle={liked ? t("inbox.unlikeComment") : t("inbox.likeComment")}
            btnClassDefault={btnClass}
            iconClass={iconClass}
          />
        ) : null}
      </div>
      {error && !iconOnly ? (
        <p className="mt-1 text-[10px] font-medium text-error">{error}</p>
      ) : null}

      {confirmTarget && typeof document !== "undefined"
        ? createPortal(
          <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
          role="dialog"
          aria-modal="true"
          onClick={(e) => {
            e.stopPropagation();
            if (busyAction == null) {
              setConfirmTarget(null);
            }
          }}
        >
          <div
            className="w-full max-w-sm rounded-2xl border border-outline-variant/20 bg-surface-container-high p-5 shadow-2xl"
            onClick={(e) => {
              e.stopPropagation();
            }}
          >
            <h3 className="text-sm font-bold text-on-surface">
              {confirmTarget === "delete"
                ? t("inbox.deleteCommentConfirmTitle")
                : confirmTarget === "like" || confirmTarget === "unlike"
                  ? liked
                    ? t("inbox.unlikeCommentConfirmTitle")
                    : t("inbox.likeCommentConfirmTitle")
                : confirmTarget === "block"
                  ? t("inbox.blockCommentConfirmTitle")
                  : confirmTarget === "hide"
                    ? t("inbox.hideCommentConfirmTitle")
                    : confirmTarget === "unhide"
                      ? t("inbox.unhideCommentConfirmTitle")
                  : t("inbox.openFacebookBlockConfirmTitle")}
            </h3>
            <p className="mt-2 text-xs leading-relaxed text-on-surface-variant">
              {confirmTarget === "delete"
                ? t("inbox.deleteCommentConfirmBody")
                : confirmTarget === "like" || confirmTarget === "unlike"
                  ? liked
                    ? t("inbox.unlikeCommentConfirmBody")
                    : t("inbox.likeCommentConfirmBody")
                : confirmTarget === "block"
                  ? blockConfirmBody
                  : confirmTarget === "hide"
                    ? t("inbox.hideCommentConfirmBody")
                    : confirmTarget === "unhide"
                      ? t("inbox.unhideCommentConfirmBody")
                  : t("inbox.openFacebookBlockConfirmBody")}
            </p>
            {error ? (
              <p className="mt-2 text-[11px] font-medium text-error">{error}</p>
            ) : null}
            <div className="mt-4 flex justify-end gap-2">
              <button
                type="button"
                className="rounded-lg px-3 py-2 text-xs font-bold text-on-surface-variant transition-colors hover:bg-surface-container-highest"
                disabled={busyAction != null}
                onClick={() => {
                  setConfirmTarget(null);
                }}
              >
                {t("inbox.deleteCommentCancel")}
              </button>
              <button
                type="button"
                className="rounded-lg bg-error px-3 py-2 text-xs font-bold text-on-error transition-colors hover:opacity-90 disabled:opacity-40"
                disabled={busyAction != null}
                onClick={() => {
                  if (confirmTarget === "delete") {
                    void runAction("delete");
                    return;
                  }
                  if (confirmTarget === "block") {
                    void runAction("block");
                    return;
                  }
                  if (confirmTarget === "hide" || confirmTarget === "unhide") {
                    void runAction(confirmTarget);
                    return;
                  }
                  if (confirmTarget === "like" || confirmTarget === "unlike") {
                    void runReaction(confirmTarget);
                    return;
                  }
                  confirmOpenFacebook();
                }}
              >
                {confirmTarget === "delete"
                  ? busyAction === "delete"
                    ? t("inbox.deleteCommentDeleting")
                    : t("inbox.deleteCommentConfirm")
                  : confirmTarget === "like" || confirmTarget === "unlike"
                    ? busyReaction != null
                      ? t("inbox.moderateWorking")
                      : confirmTarget === "like"
                        ? t("inbox.likeComment")
                        : t("inbox.unlikeComment")
                  : confirmTarget === "block"
                    ? busyAction === "block"
                      ? t("inbox.blockCommentBlocking")
                      : t("inbox.blockCommentConfirm")
                    : confirmTarget === "hide"
                      ? busyAction === "hide"
                        ? t("inbox.moderateWorking")
                        : t("inbox.hideComment")
                      : confirmTarget === "unhide"
                        ? busyAction === "unhide"
                          ? t("inbox.moderateWorking")
                          : t("inbox.unhideComment")
                    : t("inbox.openFacebookBlockConfirm")}
              </button>
            </div>
          </div>
        </div>,
          document.body,
        )
        : null}
    </>
  );
}
