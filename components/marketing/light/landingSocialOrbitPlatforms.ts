import {
  LANDING_INTEGRATION_CHANNELS,
  LANDING_INTEGRATION_TOOLS,
} from "@/components/marketing/landingIntegrations";

export type LandingSocialOrbitIcon = {
  readonly id: string;
  readonly label: string;
  readonly src: string;
};

const TOOL_IDS_IN_MEGA_MENU = new Set(["canva", "google_drive", "dropbox", "onedrive", "chatgpt", "mcp"]);

/** Icons orbiting the landing-page 3D core; mirrors the Integrations mega menu. */
export const LANDING_SOCIAL_ORBIT_ICONS: readonly LandingSocialOrbitIcon[] = [
  ...LANDING_INTEGRATION_CHANNELS,
  ...LANDING_INTEGRATION_TOOLS.filter((item) => TOOL_IDS_IN_MEGA_MENU.has(item.id)),
];
