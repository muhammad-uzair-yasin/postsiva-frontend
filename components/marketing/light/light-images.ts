import type { StaticImageData } from "next/image";

import { marketingImageHeroBanner } from "@/components/marketing/productScreens/heroBanner";
import { marketingImagePostComposer } from "@/components/marketing/productScreens/postComposer";
import { marketingImageDashboard } from "@/components/marketing/productScreens/dashboard";
import { marketingImageInbox } from "@/components/marketing/productScreens/inbox";
import { marketingImageContentManager } from "@/components/marketing/productScreens/contentManager";
import { marketingImagePivaAgent } from "@/components/marketing/productScreens/pivaAgent";
import { marketingImageAutoComment } from "@/components/marketing/productScreens/autoComment";
import { marketingImageComposeWithPreview } from "@/components/marketing/productScreens/composeWithPreview";
import { marketingImageWorkspaces } from "@/components/marketing/productScreens/workspaces";
import { marketingImageWhatsapp } from "@/components/marketing/productScreens/whatsapp";
import calendarImg from "@/assets/post-scheduler-calendar-view-screenshot.png";
import pipelineImg from "@/assets/images/content_pipeline.png";

export const lightLandingHero = marketingImageHeroBanner;
export const lightLandingWorkspace = marketingImageWorkspaces;
export const lightLandingPiva = marketingImagePivaAgent;

/** Uniform collage card width (matches reference frame). */
export const LIGHT_COLLAGE_CARD_WIDTH = 300;
export const LIGHT_COLLAGE_IMAGE_HEIGHT = 200;

export interface LightCollageCard {
  readonly src: StaticImageData;
  readonly altKey: string;
  readonly titleKey: string;
  /** Absolute position only — size is uniform via LIGHT_COLLAGE_CARD_WIDTH. */
  readonly className: string;
}

export const LIGHT_COLLAGE_CARDS: readonly LightCollageCard[] = [
  {
    src: marketingImagePostComposer,
    altKey: "marketing.composePreviewImageAlt",
    titleKey: "marketing.lightCollageCardComposerTitle",
    className: "left-[0%] top-[2%]",
  },
  {
    src: marketingImageDashboard,
    altKey: "marketing.statsDashboardImageAlt",
    titleKey: "marketing.lightCollageCardDashboardTitle",
    className: "right-[0%] top-[2%]",
  },
  {
    src: marketingImageContentManager,
    altKey: "marketing.allInOneImageAlt",
    titleKey: "marketing.lightCollageCardContentTitle",
    className: "left-[0%] top-[42%]",
  },
  {
    src: marketingImageInbox,
    altKey: "marketing.inboxImageAlt",
    titleKey: "marketing.lightCollageCardInboxTitle",
    className: "right-[0%] top-[52%]",
  },
  {
    src: marketingImageAutoComment,
    altKey: "marketing.inboxImageAlt",
    titleKey: "marketing.lightCollageCardAutoCommentTitle",
    className: "left-[1%] top-[76%]",
  },
  {
    src: marketingImageComposeWithPreview,
    altKey: "marketing.composePreviewImageAlt",
    titleKey: "marketing.lightCollageCardPreviewTitle",
    className: "right-[1%] top-[74%]",
  },
  {
    src: marketingImagePivaAgent,
    altKey: "marketing.pivaAgentImageAlt",
    titleKey: "marketing.lightCollageCardPivaTitle",
    className: "right-[20%] top-[80%]",
  },
];

export const LIGHT_USE_CASE_IMAGES = {
  composer: marketingImagePostComposer,
  inbox: marketingImageInbox,
  calendar: calendarImg,
  whatsapp: marketingImageWhatsapp,
} as const;

export const LIGHT_UPDATE_IMAGES = {
  features: pipelineImg,
  pricing: marketingImageDashboard,
  help: marketingImageComposeWithPreview,
} as const;
