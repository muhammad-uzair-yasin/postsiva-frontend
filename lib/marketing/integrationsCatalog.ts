import {
  LANDING_INTEGRATION_CHANNELS,
  LANDING_INTEGRATION_TOOLS,
} from "@/components/marketing/landingIntegrations";

export type MarketingIntegration = {
  readonly id: string;
  readonly label: string;
  readonly src: string;
  readonly group: "Social channels" | "Creative & cloud" | "Automation";
  readonly description: string;
  readonly href: string;
};

const DESCRIPTIONS: Record<string, string> = {
  instagram: "Connect professional Instagram accounts for posts, Reels, Stories, DMs, and insights.",
  facebook: "Publish to Facebook Pages and manage Page conversations from your workspace.",
  linkedin: "Connect profiles and organization pages for native LinkedIn publishing workflows.",
  tiktok: "Prepare short-form video content and publish through TikTok-ready workflows.",
  youtube: "Manage YouTube uploads with titles, descriptions, thumbnails, and scheduling support.",
  threads: "Connect Threads to keep fast conversation-led posts in the same composer flow.",
  pinterest: "Create pins and route visual campaigns to the right boards.",
  bluesky: "Publish to Bluesky with account-specific copy and decentralized social support.",
  mastodon: "Connect Mastodon instances with workspace-scoped publishing.",
  wordpress: "Publish long-form content to self-hosted WordPress sites.",
  whatsapp: "Use WhatsApp-oriented assistant workflows for supported workspace automation.",
  canva: "Bring Canva designs into the composer and keep creative production close to publishing.",
  google_drive: "Import assets from Google Drive into your media and composer workflows.",
  dropbox: "Attach approved Dropbox creative assets without manual downloading.",
  onedrive: "Use OneDrive files as part of your cloud media workflow.",
  zapier: "Route publishing and workflow events through Zapier-style automation.",
  n8n: "Connect Postsiva workflows to n8n and internal automation pipelines.",
  mcp: "Use Postsiva through MCP-compatible clients and agent workflows.",
  chatgpt: "Bring Postsiva tools into ChatGPT Apps for guided social workflows.",
};

const HELP_HREFS: Record<string, string> = {
  instagram: "/help/social-accounts/connect-instagram-account",
  facebook: "/help/social-accounts/connect-facebook-account",
  linkedin: "/help/social-accounts/connect-linkedin-account",
  tiktok: "/help/social-accounts/connect-tiktok-account",
  youtube: "/help/social-accounts/connect-youtube-channel",
  threads: "/help/social-accounts/connect-threads-and-pinterest",
  pinterest: "/help/social-accounts/connect-threads-and-pinterest",
  bluesky: "/help/social-accounts/connect-bluesky-account",
  mastodon: "/help/social-accounts/connect-mastodon-account",
  wordpress: "/help/wordpress/self-hosted",
  whatsapp: "/help/ai-automation/use-postsiva-gpt-and-mcp",
  canva: "/help/media-canva/connect-canva-and-cloud-media",
  google_drive: "/help/media-canva/connect-canva-and-cloud-media",
  dropbox: "/help/media-canva/connect-canva-and-cloud-media",
  onedrive: "/help/media-canva/connect-canva-and-cloud-media",
  zapier: "https://docs.postsiva.com/introduction",
  n8n: "https://docs.postsiva.com/introduction",
  mcp: "/help/ai-automation/use-postsiva-gpt-and-mcp",
  chatgpt: "/help/ai-automation/use-postsiva-gpt-and-mcp",
};

const CLOUD_TOOL_IDS = new Set(["canva", "google_drive", "dropbox", "onedrive"]);

export const MARKETING_INTEGRATIONS: readonly MarketingIntegration[] = [
  ...LANDING_INTEGRATION_CHANNELS.map((item) => ({
    ...item,
    group: "Social channels" as const,
    description: DESCRIPTIONS[item.id] ?? "Connect this channel to Postsiva.",
    href: HELP_HREFS[item.id] ?? "/help/social-accounts",
  })),
  ...LANDING_INTEGRATION_TOOLS.map((item) => ({
    ...item,
    group: CLOUD_TOOL_IDS.has(item.id)
      ? ("Creative & cloud" as const)
      : ("Automation" as const),
    description: DESCRIPTIONS[item.id] ?? "Connect this tool to Postsiva.",
    href: HELP_HREFS[item.id] ?? "/help",
  })),
] as const;

export const MARKETING_INTEGRATION_GROUPS = [
  "Social channels",
  "Creative & cloud",
  "Automation",
] as const;
