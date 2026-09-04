import type { LucideIcon } from "lucide-react";
import {
  FolderKanban,
  Inbox,
  MessageCircle,
  PenLine,
  SendHorizonal,
  Smartphone,
  Sparkles,
  Workflow,
} from "lucide-react";

export type LandingFeatureItem = {
  id: string;
  title: string;
  description: string;
  icon: LucideIcon;
  href: string;
  badge?: string;
};

/** Buffer-style Features mega-menu items — Postsiva product surfaces only. */
export const LANDING_FEATURE_ITEMS: readonly LandingFeatureItem[] = [
  {
    id: "composer",
    title: "Composer",
    description: "Build drafts with live previews for every connected network.",
    icon: PenLine,
    href: "/#compose-preview",
  },
  {
    id: "publish",
    title: "Publish",
    description: "Plan and schedule content across your social channels.",
    icon: SendHorizonal,
    href: "/#all-in-one",
  },
  {
    id: "inbox",
    title: "Inbox",
    description: "Manage comments, replies, and auto-commenting in one place.",
    icon: Inbox,
    href: "/#inbox-auto-comment",
  },
  {
    id: "workspaces",
    title: "Workspaces",
    description: "Separate brands, clients, and teams with their own channels.",
    icon: FolderKanban,
    href: "/#choose-workspace",
  },
  {
    id: "piva",
    title: "Piva",
    description: "Draft, publish, and pull live workspace data from conversation.",
    icon: Sparkles,
    href: "/#piva-agent",
  },
  {
    id: "whatsapp",
    title: "WhatsApp",
    description: "Send drafts, approvals, and reminders from WhatsApp.",
    icon: MessageCircle,
    href: "/#whatsapp",
  },
  {
    id: "mobile",
    title: "Mobile",
    description: "Use dashboard, composer, and inbox from your phone.",
    icon: Smartphone,
    href: "/#mobile-app",
  },
  {
    id: "mcp",
    title: "MCP & GPT",
    description: "Connect Postsiva to ChatGPT, Claude, Cursor, and other agents.",
    icon: Workflow,
    href: "/#postsiva-gpt",
    badge: "New",
  },
] as const;
