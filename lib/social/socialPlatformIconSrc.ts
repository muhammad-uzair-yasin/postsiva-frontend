import type { StaticImageData } from "next/image";
import bluesky from "@/assets/social-icons/bluesky.png";
import fb from "@/assets/social-icons/fb.png";
import instagram from "@/assets/social-icons/instagram.png";
import linkedin from "@/assets/social-icons/linkedin.png";
import pinterest from "@/assets/social-icons/pinterest.png";
import threads from "@/assets/social-icons/threads.png";
import tiktok from "@/assets/social-icons/tiktok.png";
import yt from "@/assets/social-icons/yt.png";
import mastodon from "@/assets/social-icons/mastodon.png";

const wordpressSvg =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 120 120'%3E%3Crect width='120' height='120' rx='24' fill='%2321759B'/%3E%3Cpath fill='white' d='M60 18a42 42 0 1 0 0 84 42 42 0 0 0 0-84Zm-37 42c0-5.4 1.2-10.5 3.3-15.1L44 93.2A37 37 0 0 1 23 60Zm37 37c-3.6 0-7.1-.5-10.4-1.5l11.1-32.2 11.4 31.3.3.6A36.8 36.8 0 0 1 60 97Zm5.1-54.3c2.2-.1 4.2-.4 4.2-.4 2-.2 1.8-3.2-.2-3.1 0 0-6 .5-9.8.5-3.6 0-9.7-.5-9.7-.5-2-.1-2.2 3-.2 3.1 0 0 1.9.3 3.9.4l5.7 15.7-8 24-13.4-39.7c2.2-.1 4.2-.4 4.2-.4 2-.2 1.8-3.2-.2-3.1 0 0-6 .5-9.8.5-.7 0-1.5 0-2.4-.1A37 37 0 0 1 86 31.1c-.2 0-.3 0-.5 0-3.6 0-6.2 3.1-6.2 6.4 0 3 1.8 5.6 3.6 8.6 1.4 2.5 3 5.6 3 10.1 0 3.1-1.2 6.7-2.8 11.7l-3.7 12.3-14.3-37.5Zm28.7-.5A36.8 36.8 0 0 1 78.9 91l11.3-32.7c2.1-5.2 2.8-9.3 2.8-12.9 0-1.2-.1-2.2-.2-3.2Z'/%3E%3C/svg%3E";

function iconSrc(img: StaticImageData | string): string {
  return typeof img === "string" ? img : img.src;
}

/**
 * Brand logos under `assets/social-icons/`.
 * `x` reuses the Threads asset until a dedicated X logo file exists.
 */
export type SocialPlatformIconId =
  | "instagram"
  | "facebook"
  | "linkedin"
  | "tiktok"
  | "youtube"
  | "pinterest"
  | "threads"
  | "bluesky"
  | "mastodon"
  | "wordpress"
  | "x"
  | "whatsapp";

export const SOCIAL_PLATFORM_ICON_SRC: Record<SocialPlatformIconId, string> = {
  instagram: iconSrc(instagram),
  facebook: iconSrc(fb),
  linkedin: iconSrc(linkedin),
  tiktok: iconSrc(tiktok),
  youtube: iconSrc(yt),
  pinterest: iconSrc(pinterest),
  threads: iconSrc(threads),
  bluesky: iconSrc(bluesky),
  mastodon: iconSrc(mastodon),
  wordpress: wordpressSvg,
  x: iconSrc(threads),
  whatsapp: "https://cdn.simpleicons.org/whatsapp/25D366",
};

export function isSocialPlatformIconId(
  id: string,
): id is SocialPlatformIconId {
  return id in SOCIAL_PLATFORM_ICON_SRC;
}
