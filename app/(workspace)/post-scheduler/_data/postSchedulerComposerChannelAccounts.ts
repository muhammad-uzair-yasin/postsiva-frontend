import { isSocialPlatformIconId } from "@/lib/social/socialPlatformIconSrc";
import type { SocialPlatformIconId } from "@/lib/social/socialPlatformIconSrc";
import type { WorkspaceHeaderAccountRow } from "@/lib/workspace/headerAccountsTypes";

/** One selectable channel row in the post scheduler composer (mirrors workspace header account shape). */
export interface ComposerChannelAccount {
  readonly id: string;
  readonly displayName: string;
  readonly avatarUrl?: string;
  readonly platform: SocialPlatformIconId;
  /** LinkedIn personal profile: show "· 1st" in feed-style preview (hidden for company pages). */
  readonly linkedinShowFirstDegree?: boolean;
  /** Page / org / board id for unified POST /unified/post/* (mirrors mobile `ConnectedAccountItem`). */
  readonly targetResourceId?: string | null;
}

/** Platform id for composer UI — same set as dashboard social icons. */
export type ComposerPlatformKind = SocialPlatformIconId;

/** Map header unified profile row → composer tile + preview identity. */
export function headerRowToComposerChannel(
  row: WorkspaceHeaderAccountRow,
): ComposerChannelAccount {
  const platform: SocialPlatformIconId = isSocialPlatformIconId(row.iconId)
    ? row.iconId
    : "instagram";
  return {
    id: row.id,
    displayName: row.label,
    platform,
    avatarUrl: row.avatarUrl,
    linkedinShowFirstDegree:
      platform === "linkedin" && row.id === "linkedin" ? true : undefined,
    targetResourceId: row.targetResourceId ?? null,
  };
}
