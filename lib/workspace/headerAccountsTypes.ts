import type { SocialPlatformIconId } from "@/lib/social/socialPlatformIconSrc";

/** One selectable row in the workspace header account dropdown (from GET /unified/user-profiles/). */
export interface WorkspaceHeaderAccountRow {
  readonly id: string;
  readonly iconId: SocialPlatformIconId;
  /** Primary: @handle, page name, channel title, etc. */
  readonly label: string;
  /** Profile photo URL when available (e.g. LinkedIn `picture`); used in composer previews. */
  readonly avatarUrl?: string;
  /** Secondary: "Facebook · Page 2", "LinkedIn · Personal", … */
  readonly hint?: string;
  /**
   * Facebook page id, LinkedIn org page id, or Pinterest board id — required by POST /unified/post/* for those destinations.
   */
  readonly targetResourceId?: string | null;
  /** When true, row is visible but cannot be selected (e.g. Facebook connected with no Pages). */
  readonly disabled?: boolean;
  /** Shown under the hint when `disabled` (e.g. explain why posting is blocked). */
  readonly disabledMessage?: string;
}
