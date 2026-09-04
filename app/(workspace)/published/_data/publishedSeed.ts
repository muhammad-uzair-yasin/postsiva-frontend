export interface PublishedPost {
  id: string;
  title: string;
  excerpt: string;
  channel: string;
  date: string;
  metric: string;
}

export const PUBLISHED_POSTS: readonly PublishedPost[] = [
  {
    id: "pub1",
    title: "Why we rebuilt the composer",
    excerpt: "Faster drafts, fewer tabs, same brand voice everywhere.",
    channel: "LinkedIn",
    date: "Mar 18",
    metric: "4.2k impressions",
  },
  {
    id: "pub2",
    title: "Ship log #12",
    excerpt: "Pipeline view, AI assistant rail, persona gallery.",
    channel: "X",
    date: "Mar 15",
    metric: "892 engagements",
  },
  {
    id: "pub3",
    title: "Customer spotlight",
    excerpt: "How teams cut scheduling time in half.",
    channel: "Instagram",
    date: "Mar 10",
    metric: "12.1k reach",
  },
];
