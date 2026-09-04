/** Per-platform MCP mounts — keep in sync with postsiva-backend platform_mcp/paths.py */
export type PlatformMcpId =
  | "linkedin"
  | "instagram"
  | "tiktok"
  | "facebook"
  | "youtube"
  | "threads"
  | "bluesky"
  | "pinterest"
  | "mastodon";

export const PLATFORM_MCPS: readonly PlatformMcpId[] = [
  "linkedin",
  "instagram",
  "tiktok",
  "facebook",
  "youtube",
  "threads",
  "bluesky",
  "pinterest",
  "mastodon",
] as const;

const PLATFORM_LABELS: Record<PlatformMcpId, string> = {
  linkedin: "LinkedIn",
  instagram: "Instagram",
  tiktok: "TikTok",
  facebook: "Facebook",
  youtube: "YouTube",
  threads: "Threads",
  bluesky: "Bluesky",
  pinterest: "Pinterest",
  mastodon: "Mastodon",
};

export const UNIFIED_MCP_NAME = "Unified MCP By Postsiva";

export const UNIFIED_MCP_DESCRIPTION =
  "Use this MCP to manage all connected social platforms from one Postsiva workspace. " +
  "Publish, schedule, draft, read posts, reply to comments, run analytics, and use AI content tools " +
  "across LinkedIn, Instagram, TikTok, Facebook, YouTube, Threads, Bluesky, Pinterest, and Mastodon. " +
  "Prefer Unified MCP when the user works across multiple networks or has not chosen a single platform. " +
  "Authenticate with a workspace API key (X-API-Key header or ?api-key=).";

export function getPlatformMcpName(platformId: PlatformMcpId): string {
  return `${PLATFORM_LABELS[platformId]} By Postsiva`;
}

export function getPlatformMcpLabel(platformId: PlatformMcpId): string {
  return PLATFORM_LABELS[platformId];
}

export function getPlatformMcpDescription(platformId: PlatformMcpId): string {
  const label = PLATFORM_LABELS[platformId];
  return (
    `Use this MCP only for ${label} in Postsiva. ` +
    `When the user wants to publish, schedule, draft, read posts, reply to comments, check analytics, ` +
    `or manage ${label} accounts in their Postsiva workspace, call tools from this server. ` +
    `Do not use it for other social networks — switch to that platform's MCP or Unified MCP instead. ` +
    `Authenticate with a workspace API key (X-API-Key header or ?api-key=).`
  );
}

/** Root host path without trailing /mcp (e.g. https://mcp.postsiva.com). */
export function getMcpServerRoot(mcpBaseUrl: string): string {
  return mcpBaseUrl.replace(/\/mcp$/, "");
}

export function getUnifiedLocalMcpUrl(mcpBaseUrl: string): string {
  return mcpBaseUrl;
}

export function getUnifiedWebMcpUrl(mcpBaseUrl: string): string {
  return `${getMcpServerRoot(mcpBaseUrl)}/web/mcp`;
}

export function getPlatformMcpUrl(mcpBaseUrl: string, platformId: PlatformMcpId): string {
  return `${getMcpServerRoot(mcpBaseUrl)}/${platformId}/mcp`;
}

/** Full MCP URL for web clients that accept ?api-key= (Claude.ai, MCP Inspector, …). */
export function buildMcpUrlWithApiKey(baseUrl: string, apiKey: string): string {
  const url = baseUrl.trim();
  const key = apiKey.trim();
  if (!url || !key) {
    return url;
  }
  const sep = url.includes("?") ? "&" : "?";
  return `${url}${sep}api-key=${encodeURIComponent(key)}`;
}

export function platformMcpConfigJson(
  mcpBaseUrl: string,
  platformId: PlatformMcpId,
  apiKey: string,
): string {
  return JSON.stringify(
    {
      mcpServers: {
        [`postsiva-${platformId}`]: {
          url: getPlatformMcpUrl(mcpBaseUrl, platformId),
          headers: { "X-API-Key": apiKey || "API_KEY" },
        },
      },
    },
    null,
    2,
  );
}

export function unifiedMcpConfigJson(mcpBaseUrl: string, apiKey: string): string {
  return JSON.stringify(
    {
      mcpServers: {
        "unified-mcp": {
          url: mcpBaseUrl,
          headers: { "X-API-Key": apiKey || "API_KEY" },
        },
      },
    },
    null,
    2,
  );
}
