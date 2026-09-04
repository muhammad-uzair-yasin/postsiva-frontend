import type { Metadata } from "next";

import {
  DEFAULT_OG_IMAGE_PATH,
  DEFAULT_PUBLIC_DESCRIPTION,
} from "@/lib/seo/publicPageMeta";
import { buildCanonicalUrl, getCanonicalOrigin } from "@/lib/seo/siteOrigin";

export type PageSeoInput = {
  path: string;
  title: string;
  description?: string;
  /** Home and other pages that must not use the `%s | Postsiva` template. */
  absoluteTitle?: boolean;
  index?: boolean;
};

export function buildPageMetadata(input: PageSeoInput): Metadata {
  const description = input.description ?? DEFAULT_PUBLIC_DESCRIPTION;
  const canonical = buildCanonicalUrl(input.path);
  const origin = getCanonicalOrigin();
  const ogImage = `${origin}${DEFAULT_OG_IMAGE_PATH}`;
  const robots =
    input.index === false
      ? { index: false as const, follow: false as const }
      : { index: true as const, follow: true as const };

  const title = input.absoluteTitle ? { absolute: input.title } : input.title;

  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      type: "website",
      url: canonical,
      title: input.title,
      description,
      siteName: "Postsiva",
      images: [{ url: ogImage, width: 192, height: 192, alt: "Postsiva" }],
    },
    twitter: {
      card: "summary_large_image",
      title: input.title,
      description,
      images: [ogImage],
    },
    robots,
  };
}
