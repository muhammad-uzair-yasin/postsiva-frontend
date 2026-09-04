export interface AdPlatformItem {
  id: string;
  name: string;
  description: string;
  icon: string;
  iconFilled: boolean;
  iconWrapperClassName: string;
  hoverAccent: "primary" | "secondary";
  badge?: string;
}

export const AD_PLATFORM_ITEMS: readonly AdPlatformItem[] = [
  {
    id: "instagram",
    name: "Instagram",
    description: "Visual storytelling and community",
    icon: "photo_camera",
    iconFilled: true,
    iconWrapperClassName:
      "bg-gradient-to-tr from-[#f9ce34] via-[#ee2a7b] to-[#6228d7] shadow-[0_0_20px_rgba(238,42,123,0.3)]",
    hoverAccent: "primary",
  },
  {
    id: "linkedin",
    name: "LinkedIn",
    description: "Professional networking and insights",
    icon: "work",
    iconFilled: true,
    iconWrapperClassName:
      "bg-[#0A66C2] shadow-[0_0_20px_rgba(10,102,194,0.3)]",
    hoverAccent: "primary",
  },
  {
    id: "tiktok",
    name: "TikTok",
    description: "Short-form viral content",
    icon: "music_note",
    iconFilled: true,
    iconWrapperClassName:
      "border-b-4 border-r-4 border-secondary/50 bg-black shadow-[0_0_20px_rgba(0,0,0,0.5)]",
    hoverAccent: "secondary",
  },
  {
    id: "youtube",
    name: "YouTube",
    description: "Video content and streaming",
    icon: "play_circle",
    iconFilled: true,
    iconWrapperClassName: "bg-[#FF0000] shadow-[0_0_20px_rgba(255,0,0,0.3)]",
    hoverAccent: "primary",
  },
  {
    id: "facebook",
    name: "Facebook",
    description: "Global reach and community pages",
    icon: "groups",
    iconFilled: true,
    iconWrapperClassName: "bg-[#1877F2] shadow-[0_0_20px_rgba(24,119,242,0.3)]",
    hoverAccent: "secondary",
  },
  {
    id: "pinterest",
    name: "Pinterest",
    description: "Pins, boards, and visual discovery",
    icon: "push_pin",
    iconFilled: true,
    iconWrapperClassName:
      "bg-[#E60023] shadow-[0_0_20px_rgba(230,0,35,0.25)]",
    hoverAccent: "primary",
  },
  {
    id: "threads",
    name: "Threads",
    description: "Text updates from Meta",
    icon: "chat_bubble",
    iconFilled: true,
    iconWrapperClassName:
      "bg-zinc-900 shadow-[0_0_20px_rgba(255,255,255,0.08)] ring-1 ring-white/10",
    hoverAccent: "secondary",
  },
  {
    id: "bluesky",
    name: "Bluesky",
    description: "Decentralized social with your handle",
    icon: "flutter_dash",
    iconFilled: true,
    iconWrapperClassName:
      "bg-[#0085FF] shadow-[0_0_20px_rgba(0,133,255,0.35)]",
    hoverAccent: "primary",
  },
  {
    id: "mastodon",
    name: "Mastodon",
    description: "Federated posting and community replies",
    icon: "alternate_email",
    iconFilled: true,
    iconWrapperClassName:
      "bg-[#6364FF] shadow-[0_0_20px_rgba(99,100,255,0.35)]",
    hoverAccent: "secondary",
  },
  {
    id: "wordpress",
    name: "WordPress",
    description: "Native site authorization",
    icon: "language",
    iconFilled: true,
    iconWrapperClassName:
      "bg-[#21759B] shadow-[0_0_20px_rgba(33,117,155,0.32)]",
    hoverAccent: "primary",
    badge: "Beta",
  },
];
