"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactElement,
} from "react";

import {
  getStoredAccessToken,
  getStoredActiveWorkspaceId,
} from "@/lib/auth/session";
import {
  avatarUriForDisplay,
  resolveInboxAvatarUri,
} from "@/lib/inbox/inboxAvatarUri";
import type { UnifiedInboxPlatform } from "@/lib/inbox/unifiedInboxTypes";
import { refreshLinkedInCommentAuthorProfile } from "@/lib/social/unifiedCommentsApi";

interface SocialInboxCommentAvatarProps {
  readonly avatarUri: string;
  readonly userName: string;
  readonly platform: UnifiedInboxPlatform;
  readonly authorUrn?: string;
  readonly sizePx: number;
  readonly className?: string;
}

export function SocialInboxCommentAvatar({
  avatarUri,
  userName,
  platform,
  authorUrn,
  sizePx,
  className = "",
}: SocialInboxCommentAvatarProps): ReactElement {
  const fallback = avatarUriForDisplay(userName);
  const [src, setSrc] = useState(() =>
    resolveInboxAvatarUri(avatarUri, userName),
  );
  const refreshAttemptedRef = useRef(false);

  useEffect(() => {
    refreshAttemptedRef.current = false;
    setSrc(resolveInboxAvatarUri(avatarUri, userName));
  }, [avatarUri, userName]);

  const handleImageError = useCallback(() => {
    void (async () => {
      if (refreshAttemptedRef.current) {
        setSrc((current) => (current === fallback ? current : fallback));
        return;
      }

      const urn = (authorUrn ?? "").trim();
      const canRefreshLinkedIn =
        platform === "linkedin" && urn.startsWith("urn:li:");

      if (!canRefreshLinkedIn) {
        setSrc((current) => (current === fallback ? current : fallback));
        return;
      }

      refreshAttemptedRef.current = true;
      const accessToken = getStoredAccessToken();
      const workspaceId = getStoredActiveWorkspaceId();
      if (!accessToken || !workspaceId) {
        setSrc(fallback);
        return;
      }

      try {
        const refreshed = await refreshLinkedInCommentAuthorProfile(
          accessToken,
          workspaceId,
          urn,
        );
        const nextUrl = refreshed?.author_profile_image_url?.trim() ?? "";
        if (nextUrl.startsWith("http")) {
          setSrc(nextUrl);
          return;
        }
      } catch {
        // fall through to initials avatar
      }
      setSrc(fallback);
    })();
  }, [authorUrn, fallback, platform]);

  return (
    <img
      alt=""
      src={src}
      width={sizePx}
      height={sizePx}
      className={`block object-cover object-center ${className}`.trim()}
      onError={handleImageError}
    />
  );
}
