export type UnifiedInboxPlatform =
  | "instagram"
  | "linkedin"
  | "facebook"
  | "youtube"
  | "threads"
  | "tiktok"
  | "bluesky"
  | "mastodon"
  | "wordpress";

export type UnifiedInboxBodySegment =
  | { kind: "text"; text: string }
  | { kind: "hashtag"; text: string }
  | { kind: "italic"; text: string };

export interface UnifiedInboxMessage {
  id: string;
  highlighted?: boolean;
  avatarUri: string;
  platform: UnifiedInboxPlatform;
  userName: string;
  contextLabel: string;
  timeLabel: string;
  bodySegments: UnifiedInboxBodySegment[];
  parentMessageId?: string;
  sortMs?: number;
  showQuickReply?: boolean;
  showMore?: boolean;
  showFavorite?: boolean;
  likeCount?: number;
  replyApiTarget?: UnifiedInboxReplyApiTarget;
  priority?: boolean;
  unreplied?: boolean;
  /** Prefer backend `reply_count` on the comment; else nested `replies.length`. */
  threadReplyCount?: number;
  sourcePostId?: string;
  sourceCommentId?: string;
  sourceCommentUrn?: string;
  sourceCommentCid?: string;
  sourceAuthorId?: string;
  sourcePermalinkUrl?: string;
  sourcePageId?: string;
  sourceOrganizationId?: string;
  sourceYoutubeChannelId?: string;
  /** Backend platform_meta.is_hidden (Facebook moderation state) when known. */
  isHidden?: boolean;
  categoryKey?: string;
  categorySource?: string;
  categoryConfidence?: number | null;
}

export interface UnifiedInboxReplyApiTarget {
  platform: UnifiedInboxPlatform;
  commentId: string;
  postId: string;
  pageId?: string;
  organizationId?: string;
  youtubeChannelId?: string;
}
