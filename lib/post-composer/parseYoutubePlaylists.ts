/** Normalizes workspace login payload `youtube_playlists` to `{ id, name }[]`. */
export interface YoutubePlaylistOption {
  readonly id: string;
  readonly name: string;
}

export function parseYoutubePlaylists(raw: unknown): YoutubePlaylistOption[] {
  if (!Array.isArray(raw)) {
    return [];
  }
  const out: YoutubePlaylistOption[] = [];
  for (const item of raw) {
    if (!item || typeof item !== "object") {
      continue;
    }
    const o = item as Record<string, unknown>;
    const id =
      typeof o.id === "string"
        ? o.id.trim()
        : typeof o.playlist_id === "string"
          ? o.playlist_id.trim()
          : "";
    const name =
      typeof o.name === "string"
        ? o.name.trim()
        : typeof o.playlist_name === "string"
          ? o.playlist_name.trim()
          : "";
    if (id) {
      out.push({ id, name: name || id });
    }
  }
  return out;
}
