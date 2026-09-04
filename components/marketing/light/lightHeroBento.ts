/** Castly-style hero bento grid — stat cards use live API values in LightHeroBentoGrid. */
export type LightHeroCreatorCard = {
  readonly name: string;
  readonly role: string;
  readonly image: string;
};

export type LightHeroStatKey = "posts_created" | "posts_published" | "comments_posted";

export type LightHeroStatCard = {
  readonly statKey: LightHeroStatKey;
  readonly label: string;
  readonly bg: string;
  readonly text: string;
};

export const LIGHT_HERO_CREATORS: readonly LightHeroCreatorCard[] = [
  {
    name: "Aisha Grant",
    role: "Podcaster",
    image:
      "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&h=600&fit=crop&q=80",
  },
  {
    name: "Evan Brooks",
    role: "Content Creator",
    image:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=700&fit=crop&q=80",
  },
  {
    name: "Tom Reyes",
    role: "Tech & Education",
    image:
      "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=650&fit=crop&q=80",
  },
] as const;

export const LIGHT_HERO_STATS: readonly LightHeroStatCard[] = [
  {
    statKey: "posts_created",
    label: "Posts created with Postsiva",
    bg: "bg-[#E8DEFF]",
    text: "text-[#4C1D95]",
  },
  {
    statKey: "posts_published",
    label: "Posts published across networks",
    bg: "bg-[#D1FAE5]",
    text: "text-[#065F46]",
  },
  {
    statKey: "comments_posted",
    label: "Comments posted through Postsiva",
    bg: "bg-[#DBEAFE]",
    text: "text-[#1E40AF]",
  },
] as const;

/** Column layout: index → vertical offset + card sequence */
export const LIGHT_HERO_BENTO_COLUMNS: readonly {
  offsetClass: string;
  items: readonly ("stat-0" | "stat-1" | "stat-2" | "creator-0" | "creator-1" | "creator-2")[];
}[] = [
  { offsetClass: "md:mt-0", items: ["stat-0"] },
  { offsetClass: "md:mt-0", items: ["creator-0"] },
  { offsetClass: "md:mt-10", items: ["creator-1", "stat-1"] },
  { offsetClass: "md:mt-16", items: ["creator-2"] },
  { offsetClass: "md:mt-24", items: ["stat-2"] },
] as const;
