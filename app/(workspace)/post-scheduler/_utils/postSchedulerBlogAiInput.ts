const BLOG_SOURCE_URL_RE = /^https?:\/\/.+/i;

const BLOG_URL_REWRITE_PROMPT =
  "Rewrite and expand this blog article for WordPress. Improve structure, SEO, and readability while preserving the core message.";

export function isBlogSourceUrl(input: string): boolean {
  return BLOG_SOURCE_URL_RE.test(input.trim());
}

export function parseBlogAiInput(raw: string): {
  prompt: string;
  source_url?: string;
} {
  const trimmed = raw.trim();
  if (isBlogSourceUrl(trimmed)) {
    return {
      prompt: BLOG_URL_REWRITE_PROMPT,
      source_url: trimmed,
    };
  }
  return { prompt: trimmed };
}
