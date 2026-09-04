import type { LucideIcon } from "lucide-react";
import {
  Activity,
  BarChart3,
  Bot,
  Cpu,
  CalendarClock,
  Eye,
  FileText,
  GitBranch,
  LayoutDashboard,
  LineChart,
  Mail,
  MessageSquare,
  PenLine,
  Tags,
  Users,
  Wallet,
} from "lucide-react";

export interface AdminNavItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

export interface AdminNavSection {
  title: string;
  items: AdminNavItem[];
}

export const ADMIN_NAV_SECTIONS: AdminNavSection[] = [
  {
    title: "Overview",
    items: [
      { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
      { href: "/admin/users", label: "Users", icon: Users },
      { href: "/admin/paid-users", label: "Paid users", icon: Wallet },
    ],
  },
  {
    title: "Analytics",
    items: [
      { href: "/admin/tracking", label: "Tracking", icon: BarChart3 },
      { href: "/admin/api-hits", label: "API Hits", icon: Activity },
      { href: "/admin/emails", label: "Emails", icon: Mail },
    ],
  },
  {
    title: "Operations",
    items: [
      { href: "/admin/workers", label: "Workers", icon: Cpu },
      { href: "/admin/scheduled-posts", label: "Scheduled Posts", icon: CalendarClock },
      { href: "/admin/insights-snapshots?tab=access", label: "Insights", icon: LineChart },
      { href: "/admin/comment-watch", label: "Comment Watch", icon: Eye },
      { href: "/admin/comment-categories", label: "Comment Categories", icon: Tags },
    ],
  },
  {
    title: "AI",
    items: [
      { href: "/admin/ai-providers", label: "AI Providers", icon: Bot },
      { href: "/admin/ai-manager", label: "AI Manager", icon: MessageSquare },
      { href: "/admin/system-prompts", label: "System Prompts", icon: FileText },
      { href: "/admin/agent-flows", label: "Agent Flows", icon: GitBranch },
      { href: "/admin/main-writer-playground", label: "Main Writer", icon: PenLine },
      { href: "/admin/ai-usage", label: "AI Usage", icon: Wallet },
    ],
  },
];

export function isActiveAdminPath(pathname: string, href: string): boolean {
  if (href === "/admin") {
    return pathname === "/admin";
  }
  const pathOnly = href.split("?")[0];
  return pathname === pathOnly || pathname.startsWith(`${pathOnly}/`);
}
