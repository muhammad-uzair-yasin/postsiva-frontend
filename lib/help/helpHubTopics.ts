export type HelpHubTopic = {
  readonly imageKey: string;
  readonly title: string;
  readonly description: string;
  readonly href: string;
};

/** Top category cards shown on the Help Center hub. */
export const HELP_HUB_TOPICS: readonly HelpHubTopic[] = [
  {
    imageKey: "workspace-selector",
    title: "Getting started",
    description:
      "First steps for new workspaces, quick setup, and the fastest route to shipping posts.",
    href: "/help/getting-started",
  },
  {
    imageKey: "ig-connect-world",
    title: "Connecting social accounts",
    description:
      "OAuth setup, permissions, and what each network needs before Postsiva can publish.",
    href: "/help/social-accounts",
  },
  {
    imageKey: "sched-pipeline",
    title: "Scheduling and publishing",
    description:
      "Create, queue, schedule, and ship content confidently across the networks.",
    href: "/help/scheduling-publishing",
  },
  {
    imageKey: "unified-dashboard",
    title: "Managing posts",
    description:
      "Draft hygiene, editing, previews, approvals, and keeping your publishing flow clear.",
    href: "/help/managing-posts",
  },
  {
    imageKey: "media-library",
    title: "Media and Canva",
    description:
      "Bring in visuals from Canva and cloud storage without slowing down your composer.",
    href: "/help/media-canva",
  },
  {
    imageKey: "ai-toolkit",
    title: "AI and automations",
    description:
      "Use Postsiva GPT, MCP, and automation safely inside your workspace workflow.",
    href: "/help/ai-automation",
  },
  {
    imageKey: "li-connected",
    title: "Troubleshooting",
    description:
      "Fix the most common connection, publishing, and workspace issues before contacting support.",
    href: "/help/troubleshooting",
  },
] as const;

export const HELP_HUB_POPULAR_SEARCHES = ["Instagram", "Schedule", "Drafts", "Team", "LinkedIn"] as const;
