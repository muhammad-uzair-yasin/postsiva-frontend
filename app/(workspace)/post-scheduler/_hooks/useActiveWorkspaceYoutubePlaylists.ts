import { useEffect, useState } from "react";

import { getApiBaseUrl } from "@/lib/api/config";
import { fetchWithAccessTokenRetry } from "@/lib/api/fetchWithAccessTokenRetry";
import { getStoredAccessToken, getStoredActiveWorkspaceId } from "@/lib/auth/session";
import type { YoutubePlaylistOption } from "@/lib/post-composer/parseYoutubePlaylists";
import { parseYoutubePlaylists } from "@/lib/post-composer/parseYoutubePlaylists";

export function useActiveWorkspaceYoutubePlaylists(
  channelId: string | null,
): {
  readonly playlists: readonly YoutubePlaylistOption[];
} {
  const [playlists, setPlaylists] = useState<YoutubePlaylistOption[]>([]);

  useEffect(() => {
    const selectedChannelId = channelId?.trim() ?? "";
    const token = getStoredAccessToken();
    const workspaceId = getStoredActiveWorkspaceId();
    setPlaylists([]);
    if (!selectedChannelId || !token?.trim() || !workspaceId?.trim()) {
      return;
    }

    const controller = new AbortController();
    const load = async (): Promise<void> => {
      try {
        const params = new URLSearchParams({ channel_id: selectedChannelId });
        const response = await fetchWithAccessTokenRetry(
          `${getApiBaseUrl()}/youtube/user-playlist/?${params.toString()}`,
          token,
          (accessToken) => ({
            Authorization: `Bearer ${accessToken}`,
            "X-Workspace-Id": workspaceId,
            Accept: "application/json",
          }),
          { signal: controller.signal },
        );
        const payload = (await response.json()) as {
          data?: { playlists?: unknown };
        };
        if (!controller.signal.aborted) {
          setPlaylists(parseYoutubePlaylists(payload.data?.playlists));
        }
      } catch {
        if (!controller.signal.aborted) {
          setPlaylists([]);
        }
      }
    };
    void load();
    return () => controller.abort();
  }, [channelId]);

  return { playlists };
}
