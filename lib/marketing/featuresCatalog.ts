/** Full features catalog for the features page grid. */
export type FeaturesCatalogItem = {
  readonly id?: string;
  readonly icon: string;
  readonly title: string;
  readonly description: string;
  readonly tag?: string;
};

export type FeaturesCatalogCategory = {
  readonly id: string;
  readonly title: string;
  readonly features: readonly FeaturesCatalogItem[];
};

export const FEATURES_CATALOG: readonly FeaturesCatalogCategory[] = [
  {
    id: "publishing",
    title: "Publishing & Content",
    features: [
      { icon: "edit_note", title: "Unified Composer", description: "Write once with rich media and per-platform previews.", tag: "Core" },
      { icon: "send", title: "Publish Now", description: "Go live on LinkedIn, Meta, TikTok, X, and more." },
      { icon: "draft", title: "Drafts", description: "Save, refine, and publish when you're ready." },
      { icon: "perm_media", title: "Media Library", description: "Upload and reuse images and video assets." },
      { icon: "palette", title: "Canva Integration", description: "Import designs directly into your composer." },
      { icon: "view_carousel", title: "Carousels", description: "Multi-image posts with platform-aware validation." },
      { icon: "language", title: "WordPress", description: "Publish to self-hosted WordPress sites." },
      { icon: "smart_display", title: "Video Posts", description: "Stories, Reels, and feed video with normalization." },
    ],
  },
  {
    id: "scheduling",
    title: "Scheduling & Calendar",
    features: [
      { icon: "calendar_month", title: "Content Calendar", description: "Week view with drag-and-drop rescheduling.", tag: "Popular" },
      { icon: "schedule", title: "Scheduled Posts", description: "Timezone-aware automatic publishing." },
      { icon: "event_repeat", title: "Bulk Scheduling", description: "Queue campaigns and content sprints." },
      { icon: "history", title: "Scheduled Editor", description: "Edit copy or swap media without losing your slot." },
      { icon: "playlist_add", title: "Publish Queue", description: "See queued, live, and draft posts at a glance." },
    ],
  },
  {
    id: "ai",
    title: "AI & Automation",
    features: [
      { icon: "smart_toy", title: "Piva AI Agent", description: "Conversational assistant for your workspace.", tag: "Pro" },
      { icon: "auto_awesome", title: "AI Composer", description: "Ideas, images, and video → platform-ready copy." },
      { icon: "image", title: "AI Image Generation", description: "Create and edit visuals from prompts." },
      { icon: "theaters", title: "Video to Content", description: "Turn video into posts and captions." },
      { icon: "face", title: "Brand Personas", description: "Train voice and tone for on-brand AI output." },
      { icon: "forum", title: "AI Comment Replier", description: "Draft on-brand comment replies." },
      { icon: "visibility", title: "AI Watcher", description: "Surface trends and content opportunities." },
      { icon: "person_search", title: "Lead Detection", description: "Flag high-intent comments and DMs." },
      { icon: "newspaper", title: "News & Demand Explorer", description: "Turn trending topics into post ideas." },
    ],
  },
  {
    id: "inbox",
    title: "Inbox & Engagement",
    features: [
      { icon: "inbox", title: "Unified Inbox", description: "Comments and messages in one feed." },
      { icon: "chat", title: "Comment Moderation", description: "Hide, delete, or reply without leaving Postsiva." },
      { icon: "quickreply", title: "Auto-Replier", description: "AI-assisted replies at scale." },
      { icon: "photo_camera", title: "Instagram DM", description: "Direct messages alongside comments.", tag: "Pro" },
      { icon: "thumb_up", title: "Facebook Messenger", description: "Page DM support.", tag: "Pro" },
      { icon: "chat", title: "WhatsApp Agent", description: "Publish and manage via WhatsApp.", tag: "Pro" },
    ],
  },
  {
    id: "workspaces",
    title: "Workspaces & Team",
    features: [
      { icon: "dashboard", title: "Multi-Workspace", description: "Separate brands, clients, and projects." },
      { icon: "group", title: "Team Members", description: "Invite collaborators with the right roles." },
      { icon: "swap_horiz", title: "Workspace Switching", description: "Jump contexts in one click." },
      { icon: "link", title: "OAuth Connections", description: "Secure platform connections." },
      { icon: "hub", title: "Connected Accounts", description: "LinkedIn, Meta, TikTok, and more per workspace." },
    ],
  },
  {
    id: "analytics",
    title: "Analytics & Insights",
    features: [
      { icon: "analytics", title: "Unified Analytics", description: "Cross-platform performance dashboard." },
      { icon: "bar_chart", title: "Post Performance", description: "Reach and engagement per post." },
      { icon: "insights", title: "Audience Insights", description: "See when and who engages most." },
      { icon: "download", title: "Export & Reporting", description: "Data for client and internal reviews." },
    ],
  },
  {
    id: "platforms",
    title: "Platforms",
    features: [
      { icon: "business", title: "LinkedIn", description: "Profiles, Pages, and native formats." },
      { icon: "groups", title: "Facebook Pages", description: "Feed, Stories, and Page inbox." },
      { icon: "photo_camera", title: "Instagram", description: "Feed, Reels, Stories, and DMs." },
      { icon: "music_note", title: "TikTok", description: "Short-form video publishing." },
      { icon: "tag", title: "X (Twitter)", description: "Posts, threads, and media." },
      { icon: "forum", title: "Threads", description: "Cross-post and manage Threads content." },
      { icon: "cloud", title: "Bluesky", description: "Decentralized social publishing." },
      { icon: "push_pin", title: "Pinterest", description: "Pins and boards from composer." },
      { icon: "play_circle", title: "YouTube", description: "Titles, descriptions, and uploads." },
    ],
  },
  {
    id: "developer",
    title: "Developer & Extensions",
    features: [
      { icon: "key", title: "API Keys", description: "Programmatic workspace access.", tag: "Pro" },
      { icon: "api", title: "MCP Server", description: "Connect Claude, ChatGPT, and MCP clients.", tag: "Pro" },
      { icon: "psychology", title: "GPT Integration", description: "Postsiva tools inside ChatGPT.", tag: "Pro" },
      { icon: "install_desktop", title: "Chrome Extension", description: "Compose from LinkedIn and the web." },
      { icon: "smartphone", title: "Mobile App", description: "Manage content on the go." },
      { icon: "webhook", title: "Webhooks & Automations", description: "Hook into n8n and internal tooling." },
    ],
  },
] as const;

export const FEATURES_CATALOG_COUNT = FEATURES_CATALOG.reduce(
  (sum, cat) => sum + cat.features.length,
  0,
);

export function featureCatalogItemId(title: string): string {
  return `feature-${title
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")}`;
}

const FEATURE_HELP_HREF_BY_TITLE: Record<string, string> = {
  "Unified Composer": "/help/managing-posts/use-the-unified-composer",
  "Publish Now": "/help/scheduling-publishing/schedule-your-first-post",
  Drafts: "/help/managing-posts/save-and-manage-drafts",
  "Media Library": "/help/media-canva/connect-canva-and-cloud-media",
  "Canva Integration": "/help/media-canva/connect-canva-and-cloud-media",
  Carousels: "/help/managing-posts/use-the-unified-composer",
  WordPress: "/help/wordpress/self-hosted",
  "Video Posts": "/help/managing-posts/use-the-unified-composer",
  "Content Calendar": "/help/scheduling-publishing/manage-your-calendar-and-queue",
  "Scheduled Posts": "/help/scheduling-publishing/schedule-your-first-post",
  "Bulk Scheduling": "/help/scheduling-publishing/manage-your-calendar-and-queue",
  "Scheduled Editor": "/help/managing-posts/edit-a-scheduled-draft-safely",
  "Publish Queue": "/help/scheduling-publishing/manage-your-calendar-and-queue",
  "Piva AI Agent": "/help/ai-automation/use-ai-toolkit-in-create-post",
  "AI Composer": "/help/ai-automation/use-ai-toolkit-in-create-post",
  "AI Image Generation": "/help/ai-automation/use-ai-toolkit-in-create-post",
  "Video to Content": "/help/ai-automation/use-ai-toolkit-in-create-post",
  "Brand Personas": "/help/ai-automation/use-ai-toolkit-in-create-post",
  "AI Comment Replier": "/help/ai-automation/use-the-unified-inbox-and-bulk-ai-replies",
  "AI Watcher": "/help/ai-automation/use-ai-toolkit-in-create-post",
  "Lead Detection": "/help/ai-automation/use-the-unified-inbox-and-bulk-ai-replies",
  "News & Demand Explorer": "/help/ai-automation/use-ai-toolkit-in-create-post",
  "Unified Inbox": "/help/ai-automation/use-the-unified-inbox-and-bulk-ai-replies",
  "Comment Moderation": "/help/ai-automation/use-the-unified-inbox-and-bulk-ai-replies",
  "Auto-Replier": "/help/ai-automation/use-the-unified-inbox-and-bulk-ai-replies",
  "Instagram DM": "/help/ai-automation/use-the-unified-inbox-and-bulk-ai-replies",
  "Facebook Messenger": "/help/ai-automation/use-the-unified-inbox-and-bulk-ai-replies",
  "WhatsApp Agent": "/help/ai-automation/use-postsiva-gpt-and-mcp",
  "Multi-Workspace": "/help/workspaces-team/set-up-workspaces-and-switching",
  "Team Members": "/help/workspaces-team/invite-teammates-and-set-access",
  "Workspace Switching": "/help/workspaces-team/set-up-workspaces-and-switching",
  "OAuth Connections": "/help/social-accounts",
  "Connected Accounts": "/help/social-accounts",
  "Unified Analytics": "/help/getting-started/use-the-unified-dashboard",
  "Post Performance": "/help/getting-started/use-the-unified-dashboard",
  "Audience Insights": "/help/getting-started/use-the-unified-dashboard",
  "Export & Reporting": "/help/getting-started/use-the-unified-dashboard",
  LinkedIn: "/help/social-accounts/connect-linkedin-account",
  "Facebook Pages": "/help/social-accounts/connect-facebook-account",
  Instagram: "/help/social-accounts/connect-instagram-account",
  TikTok: "/help/social-accounts/connect-tiktok-account",
  "X (Twitter)": "/help/social-accounts",
  Threads: "/help/social-accounts/connect-threads-and-pinterest",
  Bluesky: "/help/social-accounts/connect-bluesky-account",
  Pinterest: "/help/social-accounts/connect-threads-and-pinterest",
  YouTube: "/help/social-accounts/connect-youtube-channel",
  "API Keys": "https://docs.postsiva.com/introduction",
  "MCP Server": "/help/ai-automation/use-postsiva-gpt-and-mcp",
  "GPT Integration": "/help/ai-automation/use-postsiva-gpt-and-mcp",
  "Chrome Extension": "/help/managing-posts/use-the-unified-composer",
  "Mobile App": "/help/getting-started/use-the-unified-dashboard",
  "Webhooks & Automations": "https://docs.postsiva.com/introduction",
};

const FEATURE_HELP_HREF_BY_CATEGORY: Record<string, string> = {
  publishing: "/help/managing-posts",
  scheduling: "/help/scheduling-publishing",
  ai: "/help/ai-automation",
  inbox: "/help/ai-automation/use-the-unified-inbox-and-bulk-ai-replies",
  workspaces: "/help/workspaces-team",
  analytics: "/help/getting-started/use-the-unified-dashboard",
  platforms: "/help/social-accounts",
  developer: "https://docs.postsiva.com/introduction",
};

export function featureHelpHref(
  feature: Pick<FeaturesCatalogItem, "title">,
  categoryId: string,
): string {
  return (
    FEATURE_HELP_HREF_BY_TITLE[feature.title] ??
    FEATURE_HELP_HREF_BY_CATEGORY[categoryId] ??
    "/help"
  );
}
