export type InspirationSource = "news" | "rss" | "trending";

export interface InspirationRow {
  readonly id: string;
  readonly title: string;
  readonly source: string | null;
  readonly publishedAt: string | null;
  readonly image: string | null;
  readonly url: string;
}

export const INSPIRATION_SOURCES: readonly {
  readonly id: InspirationSource;
  readonly labelKey: string;
  readonly viewAllHref: string;
}[] = [
  { id: "news", labelKey: "dashboard.inspirationsSourceNews", viewAllHref: "/news?tab=news" },
  { id: "rss", labelKey: "dashboard.inspirationsSourceRss", viewAllHref: "/news?tab=rss" },
  { id: "trending", labelKey: "dashboard.inspirationsSourceTrending", viewAllHref: "/news?tab=trending" },
] as const;
