import type { SocialPlatformIconId } from "@/lib/social/socialPlatformIconSrc";

/** Minimal account shape for POST /unified/post/* job building (same fields as mobile `ConnectedAccountItem`). */
export interface ComposerPostingAccount {
  readonly id: string;
  readonly displayName: string;
  readonly platform: SocialPlatformIconId;
  readonly targetResourceId?: string | null;
}
