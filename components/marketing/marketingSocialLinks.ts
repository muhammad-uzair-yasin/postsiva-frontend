import type { SocialPlatformIconId } from "@/lib/social/socialPlatformIconSrc";

export type MarketingSocialLink = {
  label: string;
  href: string;
  icon: SocialPlatformIconId | "whatsapp" | "mastodon";
};

/** Official Postsiva social profiles — shown in the marketing footer. */
export const MARKETING_SOCIAL_LINKS: readonly MarketingSocialLink[] = [
  {
    label: "WhatsApp Channel",
    href: "https://whatsapp.com/channel/0029Va81x0G3QxRt3UWQzm3C",
    icon: "whatsapp",
  },
  {
    label: "Instagram",
    href: "https://www.instagram.com/postsiva/",
    icon: "instagram",
  },
  { label: "X", href: "https://x.com/Postsiva", icon: "x" },
  {
    label: "LinkedIn",
    href: "https://www.linkedin.com/company/postiva/",
    icon: "linkedin",
  },
  {
    label: "Facebook",
    href: "https://web.facebook.com/profile.php?id=61587174115716",
    icon: "facebook",
  },
  {
    label: "TikTok",
    href: "https://www.tiktok.com/@postsiva",
    icon: "tiktok",
  },
  {
    label: "YouTube",
    href: "https://www.youtube.com/@Postsiva",
    icon: "youtube",
  },
  {
    label: "Threads",
    href: "https://www.threads.com/@postsiva",
    icon: "threads",
  },
  {
    label: "Bluesky",
    href: "https://bsky.app/profile/postsiva.bsky.social",
    icon: "bluesky",
  },
  {
    label: "Pinterest",
    href: "https://www.pinterest.com/Postsiva/",
    icon: "pinterest",
  },
  {
    label: "Mastodon",
    href: "https://mastodon.social/@Postsiva",
    icon: "mastodon",
  },
] as const;
