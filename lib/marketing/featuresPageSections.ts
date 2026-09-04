import type { StaticImageData } from "next/image";

import calendarImg from "@/assets/post-scheduler-calendar-view-screenshot.png";
import { marketingImageAiToolkit } from "@/components/marketing/productScreens/aiToolkit";
import { marketingImageAutoComment } from "@/components/marketing/productScreens/autoComment";
import { marketingImageChatgpt } from "@/components/marketing/productScreens/chatgpt";
import { marketingImageComposeWithPreview } from "@/components/marketing/productScreens/composeWithPreview";
import { marketingImageContentManager } from "@/components/marketing/productScreens/contentManager";
import { marketingImageDashboard } from "@/components/marketing/productScreens/dashboard";
import { marketingImageInbox } from "@/components/marketing/productScreens/inbox";
import { marketingImagePivaAgent } from "@/components/marketing/productScreens/pivaAgent";
import { marketingImagePostsivaMobile } from "@/components/marketing/productScreens/postsivaMobile";
import { marketingImageWhatsapp } from "@/components/marketing/productScreens/whatsapp";
import { marketingImageWorkspaces } from "@/components/marketing/productScreens/workspaces";

export type FeaturesPageSection = {
  readonly id: string;
  readonly label: string;
  readonly icon: string;
  readonly title: string;
  readonly description: string;
  readonly bullets?: readonly string[];
  readonly image: StaticImageData;
  readonly imageAlt: string;
  readonly reverse?: boolean;
  readonly subtleBg?: boolean;
  readonly inboxCta?: boolean;
};

const SPLIT_SECTIONS: readonly Omit<FeaturesPageSection, "reverse" | "subtleBg">[] = [
  {
    id: "composer",
    label: "Publishing",
    icon: "edit_square",
    title: "Composer + AI",
    description:
      "Craft the perfect message effortlessly. Our intuitive composer is augmented by AI to help you generate ideas, refine tone, and perfectly format your posts for every platform.",
    bullets: [
      "Smart caption generation based on brief prompts.",
      "Tone adjustment and platform-specific formatting.",
    ],
    image: marketingImageComposeWithPreview,
    imageAlt: "Postsiva composer with AI caption suggestions",
  },
  {
    id: "calendar",
    label: "Scheduling",
    icon: "calendar_month",
    title: "Interactive Calendar",
    description:
      "Visualize your entire content strategy at a glance. A drag-and-drop calendar that provides clarity and control over your publishing schedule.",
    image: calendarImg,
    imageAlt: "Postsiva interactive content calendar",
  },
  {
    id: "inbox",
    label: "Inbox",
    icon: "inbox",
    title: "Unified Inbox",
    description:
      "Stop switching tabs. Manage comments, direct messages, and mentions from all your connected platforms in one central, glassmorphic overlay.",
    image: marketingImageInbox,
    imageAlt: "Postsiva unified inbox",
    inboxCta: true,
  },
  {
    id: "analytics",
    label: "Analytics",
    icon: "analytics",
    title: "Unified Analytics",
    description:
      "See what's working across every network. Track reach, engagement, and trends from a single dashboard built for operators and agencies.",
    bullets: ["Cross-platform metrics in one view.", "Export-ready reporting for clients and teams."],
    image: marketingImageDashboard,
    imageAlt: "Postsiva analytics dashboard",
  },
  {
    id: "piva",
    label: "AI Assistant",
    icon: "smart_toy",
    title: "Piva AI Agent",
    description:
      "Your conversational co-pilot inside Postsiva. Draft posts, schedule content, check analytics, and manage workflows through natural language.",
    bullets: ["Workspace-aware assistant with real actions.", "Available on Pro plans with full tool access."],
    image: marketingImagePivaAgent,
    imageAlt: "Postsiva Piva AI agent",
  },
  {
    id: "workspaces",
    label: "Workspaces",
    icon: "dashboard",
    title: "Workspaces & Team",
    description:
      "Organize brands, clients, and teammates without mixing contexts. Switch workspaces instantly and keep connections isolated per project.",
    image: marketingImageWorkspaces,
    imageAlt: "Postsiva workspaces",
  },
  {
    id: "content",
    label: "Content",
    icon: "folder_open",
    title: "Content Pipeline",
    description:
      "Drafts, scheduled posts, and published content in one pipeline. Edit, preview, and keep your publishing queue organized.",
    image: marketingImageContentManager,
    imageAlt: "Postsiva content manager",
  },
  {
    id: "whatsapp",
    label: "Messaging",
    icon: "chat",
    title: "WhatsApp Agent",
    description:
      "Publish and manage content through WhatsApp conversations. Bring Postsiva to the channel your team already uses daily.",
    image: marketingImageWhatsapp,
    imageAlt: "Postsiva WhatsApp agent",
  },
  {
    id: "ai-toolkit",
    label: "AI Creation",
    icon: "auto_awesome",
    title: "AI Composer Toolkit",
    description:
      "Generate ideas, images, and video-to-post copy with AI credits built into your plan. Personas keep output on-brand.",
    image: marketingImageAiToolkit,
    imageAlt: "Postsiva AI composer toolkit",
  },
  {
    id: "comments",
    label: "Engagement",
    icon: "forum",
    title: "AI Comment Replies",
    description:
      "Draft on-brand replies to comments across connected accounts. Save hours on engagement without losing your voice.",
    image: marketingImageAutoComment,
    imageAlt: "Postsiva AI comment replies",
  },
  {
    id: "gpt-mcp",
    label: "Integrations",
    icon: "psychology",
    title: "GPT & MCP",
    description:
      "Use Postsiva inside ChatGPT and connect MCP clients. API keys and automation hooks for teams that live in their stack.",
    image: marketingImageChatgpt,
    imageAlt: "Postsiva GPT and MCP integrations",
  },
  {
    id: "mobile",
    label: "Mobile",
    icon: "smartphone",
    title: "Mobile App",
    description:
      "Manage content on the go with the Postsiva mobile experience. Stay close to your calendar, inbox, and publish queue anywhere.",
    image: marketingImagePostsivaMobile,
    imageAlt: "Postsiva mobile app",
  },
] as const;

export const FEATURES_PAGE_SECTIONS: readonly FeaturesPageSection[] = SPLIT_SECTIONS.map(
  (section, index) => ({
    ...section,
    reverse: index % 2 === 1,
    subtleBg: index % 2 === 1,
  }),
);
