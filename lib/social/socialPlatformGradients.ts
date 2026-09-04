import type { SocialPlatformIconId } from "./socialPlatformIconSrc";

export const SOCIAL_PLATFORM_GRADIENTS: Record<SocialPlatformIconId, string> = {
  instagram: "from-[#f9ce34] via-[#ee2a7b] to-[#6228d7]",
  facebook: "from-[#0866FF] via-[#0866FF] to-[#0866FF]",
  tiktok: "from-[#fe2c55] via-[#f9ce34] to-[#25f4ee]",
  youtube: "from-[#FF0000] via-[#FF0000] to-[#FF0000]",
  linkedin: "from-[#0A66C2] via-[#0A66C2] to-[#0A66C2]",
  pinterest: "from-[#E60023] via-[#E60023] to-[#E60023]",
  threads: "from-[#000000] via-[#000000] to-[#000000]",
  bluesky: "from-[#1185FE] via-[#1185FE] to-[#1185FE]",
  mastodon: "from-[#6364FF] via-[#563ACC] to-[#3088D4]",
  wordpress: "from-[#21759B] via-[#21759B] to-[#21759B]",
  x: "from-[#000000] via-[#000000] to-[#000000]",
  whatsapp: "from-[#25D366] via-[#25D366] to-[#25D366]",
};

export function getPlatformGradient(platform: SocialPlatformIconId): string {
  return SOCIAL_PLATFORM_GRADIENTS[platform] || SOCIAL_PLATFORM_GRADIENTS.instagram;
}
