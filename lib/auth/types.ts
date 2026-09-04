export interface AuthUser {
  id: string;
  email: string;
  username: string;
  full_name: string;
  image_url?: string | null;
  is_active: boolean;
  is_admin: boolean;
  email_verified: boolean;
  must_set_password: boolean;
  stats?: boolean;
  created_at: string;
  updated_at: string;
}

/**
 * Workspace row from GET /workspaces (session cache; same fields as backend WorkspaceResponse
 * where profiles are not included on list — use /workspaces when you need full detail).
 * Nested profiles match the API; use `unknown` where we do not model every field.
 */
export interface AuthWorkspaceLoginItem {
  id: string;
  name: string;
  slug: string;
  owner_id: string;
  /** Workspace logo/avatar from API (optional until backend migrated). */
  image_url?: string | null;
  /** Optional long-form description (TEXT on backend). */
  description?: string | null;
  /** Workspace UI language: en, bs */
  locale?: string | null;
  /** AI-generated post/reply language: en, bs */
  ai_output_locale?: string | null;
  created_at: string;
  updated_at: string;
  linkedin_connected: boolean;
  tiktok_connected: boolean;
  facebook_connected: boolean;
  twitter_connected: boolean;
  pinterest_connected: boolean;
  youtube_connected: boolean;
  instagram_connected: boolean;
  threads_connected?: boolean;
  blue_sky_connected?: boolean;
  mastodon_connected?: boolean;
  blue_sky_profile?: unknown;
  mastodon_profile?: unknown;
  threads_profile?: unknown;
  instagram_profile?: unknown;
  linkedin_profile?: unknown;
  linkedin_organizations?: unknown;
  tiktok_profile?: unknown;
  facebook_profile?: unknown;
  facebook_pages?: unknown;
  youtube_profile?: unknown;
  youtube_playlists?: unknown;
  connected_social_count: number;
  member_count: number;
}

export interface LoginSuccessPayload {
  access_token: string;
  token_type: string;
  user: AuthUser;
  /** Full workspace + connection snapshots from the API (not trimmed). */
  workspaces: AuthWorkspaceLoginItem[];
}

export type SignupSuccessPayload = LoginSuccessPayload;
