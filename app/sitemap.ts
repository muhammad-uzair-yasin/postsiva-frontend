import type { MetadataRoute } from "next";

import { getSiteUrl } from "@/lib/site/getSiteUrl";
import { getPublicSitemapPaths } from "@/lib/seo/sitemapRoutes";

export default function sitemap(): MetadataRoute.Sitemap {
  const siteUrl = getSiteUrl();
  const lastModified = new Date();

  return getPublicSitemapPaths().map((route) => ({
    url: route === "" ? `${siteUrl}/` : `${siteUrl}${route}`,
    lastModified,
    changeFrequency: route.startsWith("/help/") ? ("monthly" as const) : ("weekly" as const),
    priority: route === "" ? 1 : route.startsWith("/help/") ? 0.6 : 0.8,
  }));
}
