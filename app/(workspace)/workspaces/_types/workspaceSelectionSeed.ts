import type { SocialPlatformIconId } from "@/lib/social/socialPlatformIconSrc";

export type WorkspaceStitchCardVariant = "primary" | "secondary";

export interface WorkspaceStitchChannelRow {
  platform: SocialPlatformIconId;
  label: string;
}

export interface WorkspaceStitchCardSeed {
  id: string;
  variant: WorkspaceStitchCardVariant;
  initialLetter: string;
  /** Workspace-level image from API; falls back to initial letter when absent. */
  imageUrl?: string | null;
  title: string;
  /** From login `member_count`; when set, card shows count instead of Stitch avatar URLs. */
  memberCount?: number;
  memberAvatarSrcs: string[];
  /** e.g. "+5"; omit if no overflow badge */
  memberOverflowLabel?: string;
  channels: WorkspaceStitchChannelRow[];
  /** Total connected channels (may exceed `channels` length shown as chips). */
  totalChannelCount?: number;
  /** @deprecated Use totalChannelCount + empty chips UI */
  channelPlaceholder?: string;
}
