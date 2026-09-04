/** In-memory handoff: News/RSS → open composer drawer and generate caption. */

export type NewsArticleComposerSource = "news" | "rss";

export interface NewsArticleComposerHandoff {
  readonly id: string;
  readonly source: NewsArticleComposerSource;
  readonly article_url: string;
  readonly article_title: string;
  readonly article_snippet: string | null;
  readonly article_image: string | null;
  readonly accountId: string;
  readonly platform: string;
  readonly account_name: string | null;
}

let pending: NewsArticleComposerHandoff | null = null;

export function setNewsArticleComposerHandoff(
  handoff: NewsArticleComposerHandoff,
): void {
  pending = handoff;
}

export function takeNewsArticleComposerHandoff(): NewsArticleComposerHandoff | null {
  const h = pending;
  pending = null;
  return h;
}

export function peekNewsArticleComposerHandoff(): NewsArticleComposerHandoff | null {
  return pending;
}

export function mediaFromArticleImageUrl(
  imageUrl: string | null | undefined,
): { mediaId: string; publicUrl: string; mediaType: "image"; filename: string }[] {
  const url = imageUrl?.trim();
  if (!url) return [];
  return [
    {
      mediaId: "",
      publicUrl: url,
      mediaType: "image",
      filename: "article-image.jpg",
    },
  ];
}
