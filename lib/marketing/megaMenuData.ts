import type { LucideIcon } from "lucide-react";
import {
  BarChart3,
  CalendarDays,
  Handshake,
  Layers3,
  PenLine,
  Plug2,
  Share2,
  Sparkles,
  Users,
  Wrench,
} from "lucide-react";

import {
  LANDING_INTEGRATION_CHANNELS,
  LANDING_INTEGRATION_TOOLS,
} from "@/components/marketing/landingIntegrations";
import { featureCatalogItemId } from "@/lib/marketing/featuresCatalog";

export type MegaMenuLink = {
  readonly label: string;
  readonly href: string;
  readonly iconSrc?: string;
};

export type MegaMenuColumn = {
  readonly title: string;
  readonly icon: LucideIcon;
  readonly links: readonly MegaMenuLink[];
};

export const FEATURES_MEGA_MENU_COLUMNS: readonly MegaMenuColumn[] = [
  {
    title: "Create & publish",
    icon: PenLine,
    links: [
      { label: "Composer", href: "/features#composer" },
      { label: "Publish", href: `/features#${featureCatalogItemId("Publish Now")}` },
      { label: "Media library", href: `/features#${featureCatalogItemId("Media Library")}` },
      { label: "WordPress", href: `/features#${featureCatalogItemId("WordPress")}` },
      { label: "Video posts", href: `/features#${featureCatalogItemId("Video Posts")}` },
    ],
  },
  {
    title: "Plan & engage",
    icon: CalendarDays,
    links: [
      { label: "Content calendar", href: "/features#calendar" },
      { label: "Scheduled posts", href: `/features#${featureCatalogItemId("Scheduled Posts")}` },
      { label: "Unified inbox", href: "/features#inbox" },
      { label: "AI comment replies", href: "/features#comments" },
      { label: "WhatsApp agent", href: "/features#whatsapp" },
    ],
  },
  {
    title: "Measure & grow",
    icon: BarChart3,
    links: [
      { label: "Unified analytics", href: "/features#analytics" },
      { label: "Piva AI agent", href: "/features#piva" },
      { label: "Workspaces", href: "/features#workspaces" },
      { label: "MCP & GPT", href: "/features#gpt-mcp" },
      { label: "Mobile app", href: "/features#mobile" },
    ],
  },
] as const;

export const INTEGRATIONS_MEGA_MENU_COLUMNS: readonly MegaMenuColumn[] = [
  {
    title: "Social networks",
    icon: Share2,
    links: LANDING_INTEGRATION_CHANNELS.slice(0, 5).map((item) => ({
      label: item.label,
      href: "/integrations-explore",
      iconSrc: item.src,
    })),
  },
  {
    title: "More channels",
    icon: Layers3,
    links: LANDING_INTEGRATION_CHANNELS.slice(5).map((item) => ({
      label: item.label,
      href: "/integrations-explore",
      iconSrc: item.src,
    })),
  },
  {
    title: "Tools & automation",
    icon: Wrench,
    links: [
      ...LANDING_INTEGRATION_TOOLS.slice(0, 4).map((item) => ({
        label: item.label,
        href: "/integrations-explore",
        iconSrc: item.src,
      })),
      {
        label: "ChatGPT & MCP",
        href: "/integrations-explore",
        iconSrc: LANDING_INTEGRATION_TOOLS.find((t) => t.id === "chatgpt")?.src,
      },
    ],
  },
] as const;

export const MADE_FOR_MEGA_MENU_COLUMNS: readonly MegaMenuColumn[] = [
  {
    title: "Creators & brands",
    icon: Sparkles,
    links: [
      { label: "Creators", href: "/made-for/creators" },
      { label: "Small businesses", href: "/made-for/small-businesses" },
    ],
  },
  {
    title: "Teams & agencies",
    icon: Handshake,
    links: [
      { label: "Agencies", href: "/made-for/agencies" },
      { label: "Marketing teams", href: "/made-for/marketing-teams" },
    ],
  },
  {
    title: "Get started",
    icon: Users,
    links: [
      { label: "How it works", href: "/how-it-works" },
      { label: "Pricing", href: "/pricing" },
      { label: "Contact sales", href: "/contact" },
      { label: "Help center", href: "/help" },
    ],
  },
] as const;

/** Integrations column uses Plug2 in navbar label context — exported for optional use */
export const INTEGRATIONS_MEGA_MENU_ICON = Plug2;
