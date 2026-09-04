import type { LucideIcon } from "lucide-react";
import {
  BriefcaseBusiness,
  Camera,
  Handshake,
  Target,
} from "lucide-react";

export type MadeForAudience = {
  slug: string;
  title: string;
  description: string;
  icon: LucideIcon;
};

export const MADE_FOR_AUDIENCES: readonly MadeForAudience[] = [
  {
    slug: "creators",
    title: "Creators",
    description: "Stay consistent across platforms without juggling five native apps.",
    icon: Camera,
  },
  {
    slug: "small-businesses",
    title: "Small businesses",
    description: "Publish, approve, and stay visible with a simple shared workspace.",
    icon: BriefcaseBusiness,
  },
  {
    slug: "agencies",
    title: "Agencies",
    description: "Run client brands in separate workspaces with cleaner handoffs.",
    icon: Handshake,
  },
  {
    slug: "marketing-teams",
    title: "Marketing teams",
    description: "Plan, preview, schedule, and collaborate from one publishing cockpit.",
    icon: Target,
  },
] as const;

export function getMadeForAudience(slug: string): MadeForAudience | undefined {
  return MADE_FOR_AUDIENCES.find((audience) => audience.slug === slug);
}
