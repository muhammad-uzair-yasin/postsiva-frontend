/**
 * Main Writer playground — platform preview tab resolution.
 * Reuses post-scheduler live preview mockups for pixel-faithful UI.
 */

export type MainWriterPreviewPlatformId =
  | "linkedin"
  | "instagram"
  | "facebook"
  | "threads"
  | "tiktok"
  | "youtube"
  | "pinterest"
  | "bluesky"
  | "mastodon";

/** Platforms the main writer can target (matches playground multi-select). */
export const MAIN_WRITER_PREVIEW_PLATFORM_ORDER: readonly MainWriterPreviewPlatformId[] = [
  "linkedin",
  "instagram",
  "facebook",
  "threads",
  "tiktok",
  "youtube",
  "pinterest",
  "bluesky",
  "mastodon",
];

const PLATFORM_SET = new Set<string>(MAIN_WRITER_PREVIEW_PLATFORM_ORDER);

function isMainWriterPreviewPlatformId(id: string): id is MainWriterPreviewPlatformId {
  return PLATFORM_SET.has(id);
}

export function normalizeMainWriterPlatformId(raw: string): MainWriterPreviewPlatformId | null {
  const id = raw.trim().toLowerCase();
  if (!id || !isMainWriterPreviewPlatformId(id)) {
    return null;
  }
  return id;
}

/**
 * Tab list for platform previews.
 * When the user selected target platforms, show only those (stable order).
 * Otherwise show all supported platforms.
 */
export function resolveMainWriterPreviewPlatforms(
  targetPlatforms: readonly string[],
): MainWriterPreviewPlatformId[] {
  const selected = targetPlatforms
    .map(normalizeMainWriterPlatformId)
    .filter((id): id is MainWriterPreviewPlatformId => id != null);

  if (selected.length === 0) {
    return [...MAIN_WRITER_PREVIEW_PLATFORM_ORDER];
  }

  const wanted = new Set(selected);
  return MAIN_WRITER_PREVIEW_PLATFORM_ORDER.filter((platform) => wanted.has(platform));
}

export const MAIN_WRITER_PREVIEW_IDENTITY = {
  displayName: "Your Brand",
  linkedinShowFirstDegree: true,
} as const;
