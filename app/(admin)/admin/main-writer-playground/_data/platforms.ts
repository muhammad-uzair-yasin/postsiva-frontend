export interface MainWriterPlatformOption {
  id: string;
  label: string;
}

/** Unified all-mode platforms the main writer can tailor titles for. */
export const MAIN_WRITER_PLATFORM_OPTIONS: MainWriterPlatformOption[] = [
  { id: "linkedin", label: "LinkedIn" },
  { id: "facebook", label: "Facebook" },
  { id: "instagram", label: "Instagram" },
  { id: "threads", label: "Threads" },
  { id: "tiktok", label: "TikTok" },
  { id: "youtube", label: "YouTube" },
  { id: "pinterest", label: "Pinterest" },
  { id: "bluesky", label: "Bluesky" },
  { id: "mastodon", label: "Mastodon" },
];
