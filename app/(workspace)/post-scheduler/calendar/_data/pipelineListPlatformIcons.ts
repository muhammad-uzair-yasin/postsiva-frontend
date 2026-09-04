import { SOCIAL_PLATFORM_ICON_SRC } from "@/lib/social/socialPlatformIconSrc";
import type { PipelinePlatformId } from "../_types/postSchedulerCalendarListTypes";

export const PIPELINE_LIST_PLATFORM_ICON: Record<
  PipelinePlatformId,
  { src: string }
> = {
  instagram: { src: SOCIAL_PLATFORM_ICON_SRC.instagram },
  x: { src: SOCIAL_PLATFORM_ICON_SRC.x },
  tiktok: { src: SOCIAL_PLATFORM_ICON_SRC.tiktok },
  linkedin: { src: SOCIAL_PLATFORM_ICON_SRC.linkedin },
};
