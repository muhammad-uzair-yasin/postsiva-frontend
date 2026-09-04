/** Unsplash attribution helpers (production compliance). */

import type { ComposerMediaAttribution } from "@/lib/post-composer/composerAttachedMediaTypes";

const UTM_SOURCE = "postsiva";
const UTM_MEDIUM = "referral";

/** Append utm_source/utm_medium while preserving all existing query params. */
export function withUnsplashUtm(url: string): string {
  try {
    const parsed = new URL(url);
    parsed.searchParams.set("utm_source", UTM_SOURCE);
    parsed.searchParams.set("utm_medium", UTM_MEDIUM);
    return parsed.toString();
  } catch {
    return url;
  }
}

export const UNSPLASH_HOME_URL = withUnsplashUtm("https://unsplash.com/");

/**
 * When true, attaching an Unsplash photo appends photographer credit to the post body.
 * Set `NEXT_PUBLIC_UNSPLASH_CREDIT_IN_BODY=false` to disable.
 */
export function isUnsplashCreditInBodyEnabled(): boolean {
  const raw = (process.env.NEXT_PUBLIC_UNSPLASH_CREDIT_IN_BODY ?? "true")
    .trim()
    .toLowerCase();
  return raw !== "false" && raw !== "0" && raw !== "no" && raw !== "off";
}

/** Plain-text credit line for social captions (Unsplash production requirement). */
export function formatUnsplashPostBodyCredit(
  attribution: ComposerMediaAttribution,
): string {
  const username = attribution.creatorUsername?.trim().replace(/^@/, "");
  const name = attribution.creatorName?.trim();
  const who = username ? `@${username}` : name || "Unsplash";
  return `Photo by ${who} on Unsplash`;
}

/** Append Unsplash credit at the end of the post body (idempotent per credit line). */
export function appendUnsplashCreditToPostBody(
  body: string,
  attribution: ComposerMediaAttribution | undefined,
): string {
  if (!isUnsplashCreditInBodyEnabled()) {
    return body;
  }
  if (!attribution || attribution.provider !== "unsplash") {
    return body;
  }
  const line = formatUnsplashPostBodyCredit(attribution);
  if (body.includes(line)) {
    return body;
  }
  const trimmed = body.trimEnd();
  return trimmed ? `${trimmed}\n\n${line}` : line;
}
