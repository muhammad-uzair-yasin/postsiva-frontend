/** Demo content for the dashboard page (no API). */

/** Static hero when no API mapper is active (demo / placeholder). */
export const DASHBOARD_PROFILE_DEMO_PRIMARY = "@lumina_studios";
export const DASHBOARD_PROFILE_DEMO_STATS: readonly {
  readonly label: string;
  readonly value: string;
}[] = [
  { label: "posts", value: "1,284" },
  { label: "followers", value: "42.5k" },
  { label: "following", value: "892" },
];
export const DASHBOARD_PROFILE_DEMO_BIO =
  "Digital experiences for the next generation of architects. Based in SF 📐✨ #VisualArts #DesignFuture";
export const DASHBOARD_PROFILE_UNMAPPED_STATS: readonly {
  readonly label: string;
  readonly value: string;
}[] = [
  { label: "posts", value: "—" },
  { label: "followers", value: "—" },
  { label: "following", value: "—" },
];

export interface DashboardMetricCard {
  readonly label: string;
  readonly value: string;
  readonly trendPct: string;
  readonly trendUp: boolean;
  /** Material Symbols icon name (e.g. `favorite`). */
  readonly icon: string;
  readonly iconTone: "primary" | "secondary";
  readonly highlight?: boolean;
}

export const DASHBOARD_METRIC_CARDS: readonly DashboardMetricCard[] = [
  {
    label: "Post",
    value: "18,492",
    trendPct: "8%",
    trendUp: true,
    icon: "edit_note",
    iconTone: "primary",
  },
  {
    label: "Comments",
    value: "5,103",
    trendPct: "2%",
    trendUp: false,
    icon: "chat_bubble",
    iconTone: "secondary",
  },
  {
    label: "Reach",
    value: "142.8k",
    trendPct: "24%",
    trendUp: true,
    icon: "travel_explore",
    iconTone: "primary",
    highlight: true,
  },
  {
    label: "Likes",
    value: "89.2k",
    trendPct: "12%",
    trendUp: true,
    icon: "favorite",
    iconTone: "secondary",
  },
];

export const PROFILE_IMAGE_SRC =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuDe0b-LUDMi0o44y0E1vzbZdCkEk6cfhElz8puAkCqdbsD7Pv_MFlUXf3nt6E7uOeSSWNZrtkh2YKxDonW_JMbDgRVqLbNUBPljEVQO6E4Lkqp8T7QccK7461PbH7iBo8nCal_DfAB0wMVm7BHAV8IBEWlFbL-qAQYt2ateP88-gza8ikHn1bzdgQ06Poffb2BHaCcDzwnG8DHzFSt-My5GZVRqspTe11x-_ktur-ukvstJFrA86ODR0fWljTBs4AkzJfU_BE5PPuYG";

export interface EngagementDayBar {
  readonly label: string;
  /** Reels segment height as % of the chart column (demo data). */
  readonly reelsPct: number;
}

export const ENGAGEMENT_DAY_BARS: readonly EngagementDayBar[] = [
  { label: "Mon", reelsPct: 20 },
  { label: "Tue", reelsPct: 15 },
  { label: "Wed", reelsPct: 35 },
  { label: "Thu", reelsPct: 25 },
  { label: "Fri", reelsPct: 40 },
  { label: "Sat", reelsPct: 60 },
  { label: "Sun", reelsPct: 45 },
];
