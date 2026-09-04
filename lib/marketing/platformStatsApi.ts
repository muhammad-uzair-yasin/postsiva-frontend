import { getApiBaseUrl } from "@/lib/api/config";

export type PublicPlatformStats = {
  readonly success: boolean;
  readonly posts_created: number;
  readonly posts_published: number;
  readonly comments_posted: number;
  readonly images_generated: number;
  readonly agent_messages: number;
  readonly tool_calls: number;
  readonly api_requests: number;
  readonly active_users: number;
};

export async function fetchPublicPlatformStats(): Promise<PublicPlatformStats | null> {
  try {
    const res = await fetch(`${getApiBaseUrl()}/public/platform-stats`, {
      cache: "no-store",
    });
    if (!res.ok) return null;
    return (await res.json()) as PublicPlatformStats;
  } catch {
    return null;
  }
}

/** Full numeric display for marketing stat cards (708 → "708", 1000 → "1,000"). */
export function formatMarketingStat(value: number): string {
  if (!Number.isFinite(value) || value < 0) return "0";
  return Math.round(value).toLocaleString("en-US");
}
