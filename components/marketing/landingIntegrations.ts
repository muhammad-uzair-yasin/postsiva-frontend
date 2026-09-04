import { CANVA_ICON_SRC } from "@/lib/social/designProviderIconSrc";
import { CLOUD_PROVIDER_ICON_SRC } from "@/lib/social/cloudProviderIconSrc";
import { OPENAI_ICON_SRC } from "@/lib/social/openaiIconSrc";
import {
  SOCIAL_PLATFORM_ICON_SRC,
  type SocialPlatformIconId,
} from "@/lib/social/socialPlatformIconSrc";

export type LandingIntegrationIcon = {
  id: string;
  label: string;
  src: string;
  /** Absolute placement inside the icon field (desktop). */
  left: string;
  top: string;
  size: "sm" | "md" | "lg";
  /** Hide on small screens to avoid crowding. */
  hideOnMobile?: boolean;
};

const WHATSAPP_ICON =
  "https://cdn.simpleicons.org/whatsapp/25D366";
const ZAPIER_ICON = "https://cdn.simpleicons.org/zapier/FF4A00";
const N8N_ICON = "https://cdn.simpleicons.org/n8n/EA4B71";
const OPENAI_ICON = OPENAI_ICON_SRC;
const MCP_ICON =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'%3E%3Crect width='64' height='64' rx='14' fill='%231a1f2e'/%3E%3Ctext x='32' y='40' text-anchor='middle' font-family='system-ui,sans-serif' font-size='18' font-weight='700' fill='%23e8ecf4'%3EMCP%3C/text%3E%3C/svg%3E";

function social(
  id: SocialPlatformIconId,
  label: string,
  left: string,
  top: string,
  size: LandingIntegrationIcon["size"],
  hideOnMobile?: boolean,
): LandingIntegrationIcon {
  return {
    id,
    label,
    src: SOCIAL_PLATFORM_ICON_SRC[id],
    left,
    top,
    size,
    hideOnMobile,
  };
}

/** Static constellation — Postsiva channels + tools only. */
export const LANDING_INTEGRATION_FIELD_ICONS: readonly LandingIntegrationIcon[] =
  [
    social("instagram", "Instagram", "8%", "18%", "lg"),
    social("linkedin", "LinkedIn", "22%", "8%", "md"),
    social("tiktok", "TikTok", "78%", "14%", "lg"),
    social("youtube", "YouTube", "88%", "32%", "md"),
    social("facebook", "Facebook", "6%", "48%", "md"),
    social("threads", "Threads", "18%", "72%", "sm", true),
    social("pinterest", "Pinterest", "72%", "68%", "md"),
    social("bluesky", "Bluesky", "86%", "58%", "sm", true),
    social("mastodon", "Mastodon", "62%", "12%", "sm", true),
    social("wordpress", "WordPress", "38%", "78%", "sm", true),
    {
      id: "whatsapp",
      label: "WhatsApp",
      src: WHATSAPP_ICON,
      left: "48%",
      top: "10%",
      size: "md",
    },
    {
      id: "canva",
      label: "Canva",
      src: CANVA_ICON_SRC,
      left: "12%",
      top: "32%",
      size: "sm",
      hideOnMobile: true,
    },
    {
      id: "google_drive",
      label: "Google Drive",
      src: CLOUD_PROVIDER_ICON_SRC.google_drive,
      left: "92%",
      top: "72%",
      size: "sm",
      hideOnMobile: true,
    },
    {
      id: "dropbox",
      label: "Dropbox",
      src: CLOUD_PROVIDER_ICON_SRC.dropbox,
      left: "28%",
      top: "58%",
      size: "sm",
      hideOnMobile: true,
    },
    {
      id: "onedrive",
      label: "OneDrive",
      src: CLOUD_PROVIDER_ICON_SRC.onedrive,
      left: "58%",
      top: "76%",
      size: "sm",
      hideOnMobile: true,
    },
    {
      id: "zapier",
      label: "Zapier",
      src: ZAPIER_ICON,
      left: "70%",
      top: "40%",
      size: "md",
    },
    {
      id: "n8n",
      label: "n8n",
      src: N8N_ICON,
      left: "42%",
      top: "22%",
      size: "sm",
      hideOnMobile: true,
    },
    {
      id: "chatgpt",
      label: "ChatGPT",
      src: OPENAI_ICON,
      left: "54%",
      top: "52%",
      size: "sm",
      hideOnMobile: true,
    },
  ];

export const LANDING_INTEGRATION_CHANNELS: readonly {
  id: SocialPlatformIconId | "whatsapp";
  label: string;
  src: string;
}[] = [
  { id: "instagram", label: "Instagram", src: SOCIAL_PLATFORM_ICON_SRC.instagram },
  { id: "facebook", label: "Facebook", src: SOCIAL_PLATFORM_ICON_SRC.facebook },
  { id: "linkedin", label: "LinkedIn", src: SOCIAL_PLATFORM_ICON_SRC.linkedin },
  { id: "tiktok", label: "TikTok", src: SOCIAL_PLATFORM_ICON_SRC.tiktok },
  { id: "youtube", label: "YouTube", src: SOCIAL_PLATFORM_ICON_SRC.youtube },
  { id: "threads", label: "Threads", src: SOCIAL_PLATFORM_ICON_SRC.threads },
  { id: "pinterest", label: "Pinterest", src: SOCIAL_PLATFORM_ICON_SRC.pinterest },
  { id: "bluesky", label: "Bluesky", src: SOCIAL_PLATFORM_ICON_SRC.bluesky },
  { id: "mastodon", label: "Mastodon", src: SOCIAL_PLATFORM_ICON_SRC.mastodon },
  { id: "wordpress", label: "WordPress", src: SOCIAL_PLATFORM_ICON_SRC.wordpress },
  { id: "whatsapp", label: "WhatsApp", src: WHATSAPP_ICON },
];

export const LANDING_INTEGRATION_TOOLS: readonly {
  id: string;
  label: string;
  src: string;
}[] = [
  { id: "canva", label: "Canva", src: CANVA_ICON_SRC },
  {
    id: "google_drive",
    label: "Google Drive",
    src: CLOUD_PROVIDER_ICON_SRC.google_drive,
  },
  { id: "dropbox", label: "Dropbox", src: CLOUD_PROVIDER_ICON_SRC.dropbox },
  { id: "onedrive", label: "OneDrive", src: CLOUD_PROVIDER_ICON_SRC.onedrive },
  { id: "zapier", label: "Zapier", src: ZAPIER_ICON },
  { id: "n8n", label: "n8n", src: N8N_ICON },
  { id: "mcp", label: "MCP", src: MCP_ICON },
  { id: "chatgpt", label: "ChatGPT Apps", src: OPENAI_ICON },
];
