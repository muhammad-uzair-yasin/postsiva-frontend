/** GET /unified/comments/ and slice shape (matches backend unified comments). */

export interface UnifiedCommentJson {
  id: string;
  type?: string | null;
  text: string;
  author_name: string;
  commentor_name?: string | null;
  author_id?: string | null;
  author_profile_image_url?: string | null;
  created_at?: string | null;
  like_count?: number | null;
  /** LinkedIn and others: total replies when nested replies are not inlined (bulk inbox). */
  reply_count?: number | null;
  parent_id?: string | null;
  platform_meta?: Record<string, unknown> | null;
  classification?: UnifiedCommentClassificationJson | null;
  replies?: UnifiedCommentJson[] | null;
}

export interface UnifiedCommentClassificationJson {
  category_key: string;
  confidence?: number | null;
  source: "ai" | "manual" | string;
  classified_at?: string | null;
}

export interface UnifiedCommentsPostBucket {
  post_id: string;
  linkedin_page_id?: string | null;
  facebook_page_id?: string | null;
  youtube_channel_id?: string | null;
  comments_disabled?: boolean | null;
  comment_status?: string | null;
  comment_status_message?: string | null;
  comments?: UnifiedCommentJson[] | null;
}

export interface UnifiedCommentsPlatformSlice {
  posts?: UnifiedCommentsPostBucket[] | null;
  last_updated?: string | null;
  message?: string | null;
  error?: string | null;
}

export interface UnifiedCommentsResponseJson {
  success: boolean;
  message?: string;
  classification_status?: UnifiedCommentClassificationStatusJson | null;
  linkedin?: UnifiedCommentsPlatformSlice | null;
  facebook?: UnifiedCommentsPlatformSlice | null;
  instagram?: UnifiedCommentsPlatformSlice | null;
  youtube?: UnifiedCommentsPlatformSlice | null;
  threads?: UnifiedCommentsPlatformSlice | null;
  tiktok?: UnifiedCommentsPlatformSlice | null;
  bluesky?: UnifiedCommentsPlatformSlice | null;
  mastodon?: UnifiedCommentsPlatformSlice | null;
  wordpress?: UnifiedCommentsPlatformSlice | null;
}

export interface UnifiedCommentClassificationStatusJson {
  state?: "running" | "complete" | string;
  pending_count?: number | null;
  estimated_seconds?: number | null;
  total_count?: number | null;
  completed_count?: number | null;
}

export interface UnifiedCommentClassificationProgressEvent {
  state?: "running" | "complete" | "failed" | string;
  total_count?: number | null;
  pending_count?: number | null;
  completed_count?: number | null;
  comment_ids?: string[] | null;
  error?: string | null;
}

/** GET /unified/comments/by-post */
export interface UnifiedSinglePostCommentsResponseJson {
  success: boolean;
  post_id: string;
  platform: string;
  facebook_page_id?: string | null;
  linkedin_page_id?: string | null;
  youtube_channel_id?: string | null;
  comments_disabled?: boolean | null;
  comment_status?: string | null;
  comment_status_message?: string | null;
  comments: UnifiedCommentJson[];
  classification_status?: UnifiedCommentClassificationStatusJson | null;
  message?: string | null;
  error?: string | null;
}

/** GET /unified/comments/replies */
export interface UnifiedCommentRepliesResponseJson {
  success: boolean;
  platform: string;
  post_id: string;
  comment_id: string;
  linkedin_page_id?: string | null;
  facebook_page_id?: string | null;
  replies: UnifiedCommentJson[];
  message?: string | null;
  error?: string | null;
}
