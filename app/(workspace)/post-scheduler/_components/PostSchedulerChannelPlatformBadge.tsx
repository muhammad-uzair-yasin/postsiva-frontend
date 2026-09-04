import { SocialPlatformIcon } from "@/lib/social/SocialPlatformIcon";
import type { ComposerPlatformKind } from "../_data/postSchedulerComposerChannelAccounts";

export function PostSchedulerChannelPlatformBadge({
  platform,
  className = "",
}: {
  platform: ComposerPlatformKind;
  className?: string;
}): React.ReactElement {
  return (
    <span
      className={`pointer-events-none flex h-5 w-5 items-center justify-center rounded-md bg-surface-container shadow-sm ring-2 ring-surface-container ${className}`}
    >
      <SocialPlatformIcon platform={platform} className="h-3.5 w-3.5" />
    </span>
  );
}
