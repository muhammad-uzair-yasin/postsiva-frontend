import {
  type SocialPlatformIconId,
  SOCIAL_PLATFORM_ICON_SRC,
} from "./socialPlatformIconSrc";

interface SocialPlatformIconProps {
  platform: SocialPlatformIconId;
  className?: string;
  alt?: string;
}

export function SocialPlatformIcon({
  platform,
  className = "h-6 w-6",
  alt = "",
}: SocialPlatformIconProps): React.ReactElement {
  return (
    <img
      src={SOCIAL_PLATFORM_ICON_SRC[platform]}
      alt={alt}
      className={`object-contain ${className}`}
      loading="lazy"
      decoding="async"
    />
  );
}
