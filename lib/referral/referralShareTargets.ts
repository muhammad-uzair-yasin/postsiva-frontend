import type { SocialPlatformIconId } from "@/lib/social/socialPlatformIconSrc";

export type ReferralShareTarget = {
  id: string;
  label: string;
  /** Brand icon from Postsiva assets (or CDN fallback for WhatsApp). */
  icon: SocialPlatformIconId | "whatsapp-cdn" | "email";
  /** Direct share URL when the platform supports it. */
  href?: string;
  /**
   * Platforms without a web share dialog: copy referral text, then open this URL
   * so the user can paste into a post/DM.
   */
  copyThenOpen?: string;
};

const WHATSAPP_ICON_CDN = "https://cdn.simpleicons.org/whatsapp/25D366";

export function whatsappIconSrc(): string {
  return WHATSAPP_ICON_CDN;
}

export function buildReferralShareTargets(
  shareUrl: string,
  text: string,
): ReferralShareTarget[] {
  const full = `${text} ${shareUrl}`.trim();
  const encodedFull = encodeURIComponent(full);
  const encodedUrl = encodeURIComponent(shareUrl);
  const encodedText = encodeURIComponent(text);

  return [
    {
      id: "facebook",
      label: "Facebook",
      icon: "facebook",
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
    },
    {
      id: "instagram",
      label: "Instagram",
      icon: "instagram",
      copyThenOpen: "https://www.instagram.com/",
    },
    {
      id: "x",
      label: "X",
      icon: "x",
      href: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedText}`,
    },
    {
      id: "linkedin",
      label: "LinkedIn",
      icon: "linkedin",
      href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
    },
    {
      id: "whatsapp",
      label: "WhatsApp",
      icon: "whatsapp-cdn",
      href: `https://wa.me/?text=${encodedFull}`,
    },
    {
      id: "threads",
      label: "Threads",
      icon: "threads",
      href: `https://www.threads.net/intent/post?text=${encodedFull}`,
    },
    {
      id: "tiktok",
      label: "TikTok",
      icon: "tiktok",
      copyThenOpen: "https://www.tiktok.com/",
    },
    {
      id: "youtube",
      label: "YouTube",
      icon: "youtube",
      copyThenOpen: "https://www.youtube.com/",
    },
    {
      id: "pinterest",
      label: "Pinterest",
      icon: "pinterest",
      href: `https://www.pinterest.com/pin/create/button/?url=${encodedUrl}&description=${encodedText}`,
    },
    {
      id: "bluesky",
      label: "Bluesky",
      icon: "bluesky",
      href: `https://bsky.app/intent/compose?text=${encodedFull}`,
    },
    {
      id: "email",
      label: "Email",
      icon: "email",
      href: `mailto:?subject=${encodeURIComponent("Try Postsiva with me")}&body=${encodeURIComponent(`${text}\n\n${shareUrl}`)}`,
    },
  ];
}
