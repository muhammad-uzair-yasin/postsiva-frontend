/** Turn API platform keys (e.g. `facebook_page:123`) into short UI labels. */
export function formatUnifiedPostPlatformLabel(platformKey: string): string {
  const p = platformKey.trim();
  if (p === "linkedin" || p === "linkedin_personal") {
    return "LinkedIn";
  }
  if (p === "threads") {
    return "Threads";
  }
  if (p === "facebook") {
    return "Facebook";
  }
  if (p === "instagram") {
    return "Instagram";
  }
  if (p === "bluesky") {
    return "Bluesky";
  }
  if (p === "mastodon") {
    return "Mastodon";
  }
  if (p === "youtube") {
    return "YouTube";
  }
  if (p === "tiktok") {
    return "TikTok";
  }
  if (p === "pinterest") {
    return "Pinterest";
  }

  const fb = /^facebook_page:(.+)$/.exec(p);
  if (fb) {
    const id = fb[1];
    const short = id.length > 12 ? `${id.slice(0, 10)}…` : id;
    return `Facebook · page ${short}`;
  }

  const li = /^linkedin_page:(.+)$/.exec(p);
  if (li) {
    const id = li[1];
    const short = id.length > 12 ? `${id.slice(0, 10)}…` : id;
    return `LinkedIn · page ${short}`;
  }

  return p.replace(/_/g, " ");
}
