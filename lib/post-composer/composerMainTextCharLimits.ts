import type { SocialPlatformIconId } from "@/lib/social/socialPlatformIconSrc";

import type { ComposerPostingAccount } from "./composerPostingAccount";

/**
 * Main post text / caption limits checked before unified publish/schedule/draft.
 *
 * Sources (checked Mar 2026):
 * - Threads: primary post text 500 (`docs.threads.com/threads/start-a-thread`)
 * - Bluesky: `app.bsky.feed.post` text `maxGraphemes: 300` (also `maxLength: 3000` bytes in lexicon)
 *   `github.com/bluesky-social/atproto/blob/main/lexicons/app/bsky/feed/post.json`
 * - Mastodon: imported backend enforces the instance API response; most instances use 500 characters.
 * - Pinterest: product constraint you provided (`maxLength = 100`)
 * - Instagram: Meta Marketing API — Instagram ad creative message/caption fields max 2200
 *   `developers.facebook.com/docs/instagram/ads-api/reference/data-cta-requirements/`
 * - LinkedIn Help: post body max 3000 (`linkedin.com/help/linkedin/answer/a528176`)
 * - TikTok Content Posting API — Direct Post `post_info.title` max 2200 UTF-16 runes
 *   `developers.tiktok.com/doc/content-posting-api-reference-direct-post`
 * - YouTube Help: title max 100, description max 5000 (`support.google.com/youtube/answer/57404`)
 *
 * Note: `x` uses the same unified pipeline as Threads in this repo (`iconPlatformToUnifiedApiPlatform`),
 * so we apply the Threads limit here too.
 *
 * Facebook composer cap follows the product limit used throughout Postsiva.
 */
export const PLATFORM_MAIN_TEXT_MAX: Partial<
  Record<SocialPlatformIconId, number>
> = {
  facebook: 63206,
  threads: 500,
  x: 500,
  bluesky: 300,
  mastodon: 500,
  instagram: 2200,
  linkedin: 3000,
  tiktok: 2200,
  pinterest: 500,
};

/** Matches `validateComposerMainTextForJob` non-video YouTube caption cap. */
const YOUTUBE_COMPOSER_BODY_MAX = 5000;

export function composerMainTextLimitForPlatform(
  platform: string | null | undefined,
): number | undefined {
  const normalized = platform?.trim().toLowerCase();
  if (!normalized) {
    return undefined;
  }
  if (normalized === "youtube" || normalized.startsWith("youtube_channel:")) {
    return YOUTUBE_COMPOSER_BODY_MAX;
  }
  const platformKey =
    normalized === "twitter"
      ? "x"
      : normalized === "linkedin_personal" ||
          normalized.startsWith("linkedin_page:")
        ? "linkedin"
        : normalized.startsWith("facebook_page:")
          ? "facebook"
          : normalized.startsWith("pinterest_board:")
            ? "pinterest"
            : normalized;
  return PLATFORM_MAIN_TEXT_MAX[platformKey as SocialPlatformIconId];
}

export function capMainTextForPlatform(
  text: string,
  platform: string | null | undefined,
): string {
  const limit = composerMainTextLimitForPlatform(platform);
  return limit === undefined ? text : text.slice(0, limit);
}

/**
 * Shared textarea cap for unified composer: **tightest** limit among selected targets
 * (same body is sent to each). Omitted platforms (e.g. Facebook) do not add a cap.
 * Returns `undefined` when no numeric limit applies (empty selection or only uncapped targets).
 */
export function maxMainTextLengthForSelectedAccounts(
  accounts: readonly { platform: SocialPlatformIconId }[],
): number | undefined {
  if (accounts.length === 0) {
    return undefined;
  }
  const limits: number[] = [];
  for (const a of accounts) {
    if (a.platform === "youtube") {
      limits.push(YOUTUBE_COMPOSER_BODY_MAX);
      continue;
    }
    const m = PLATFORM_MAIN_TEXT_MAX[a.platform];
    if (m !== undefined) {
      limits.push(m);
    }
  }
  if (limits.length === 0) {
    return undefined;
  }
  return Math.min(...limits);
}

const YOUTUBE_TITLE_MAX = 100;
const YOUTUBE_DESCRIPTION_MAX = 5000;
const YOUTUBE_NON_VIDEO_CAPTION_MAX = 5000;
const PINTEREST_TITLE_MAX = 100;
const PINTEREST_DESCRIPTION_MAX = 500;
/** TikTok Business photo/carousel `post_info.title` (UTF-16 code units). */
const TIKTOK_PHOTO_TITLE_MAX = 90;

const PLATFORM_LABEL: Record<SocialPlatformIconId, string> = {
  threads: "Threads",
  x: "Threads / X",
  bluesky: "Bluesky",
  mastodon: "Mastodon",
  instagram: "Instagram",
  linkedin: "LinkedIn",
  tiktok: "TikTok",
  pinterest: "Pinterest",
  facebook: "Facebook",
  youtube: "YouTube",
  wordpress: "WordPress",
  whatsapp: "WhatsApp",
};

function textModeGuidance(
  kind: "text" | "image" | "video" | "carousel" | "document",
): string {
  if (kind !== "text") {
    return "";
  }
  return " Deselect that platform, or switch to Per platform specific mode to write different text per platform.";
}

function countGraphemeClusters(text: string): number {
  const Segmenter = (
    Intl as unknown as {
      Segmenter?: new (
        locales: string | undefined,
        options: { granularity: "grapheme" },
      ) => { segment: (input: string) => Iterable<{ segment: string }> };
    }
  ).Segmenter;

  if (!Segmenter) {
    return [...text].length;
  }

  const segmenter = new Segmenter(undefined, { granularity: "grapheme" });
  let n = 0;
  for (const segment of segmenter.segment(text)) {
    void segment;
    n += 1;
  }
  return n;
}

function utf16CodeUnits(text: string): number {
  return text.length;
}

function utf8Bytes(text: string): number {
  return new TextEncoder().encode(text).length;
}

export function deriveYoutubeTitleAndDescriptionFromBody(
  body: string,
  explicitTitle: string | null,
): {
  readonly youtubeTitle: string;
  readonly youtubeDescription: string;
} {
  const normalized = body.replace(/\r\n/g, "\n");

  const providedTitle = explicitTitle?.trim() ?? "";
  if (providedTitle) {
    return {
      youtubeTitle: providedTitle,
      youtubeDescription: normalized.trim(),
    };
  }

  const firstLine = normalized.split("\n")[0] ?? "";
  const title = firstLine.trim();
  const rest = normalized.split("\n").slice(1).join("\n");
  const description = rest.trim();
  return { youtubeTitle: title, youtubeDescription: description };
}

export function derivePinterestTitleAndDescriptionFromBody(
  body: string,
  explicitTitle: string | null,
): {
  readonly pinterestTitle: string;
  readonly pinterestDescription: string;
} {
  const normalized = body.replace(/\r\n/g, "\n");
  const providedTitle = explicitTitle?.trim() ?? "";
  if (providedTitle) {
    return {
      pinterestTitle: providedTitle,
      pinterestDescription: normalized.trim(),
    };
  }
  const firstLine = normalized.split("\n")[0] ?? "";
  const title = firstLine.trim();
  const rest = normalized.split("\n").slice(1).join("\n");
  const description = rest.trim();
  return {
    pinterestTitle: title,
    pinterestDescription: description,
  };
}

/** Maps to unified `tiktok.tiktok_title` + `tiktok.tiktok_text` (caption) for photo/carousel. */
export function deriveTiktokTitleAndCaptionFromBody(
  body: string,
  explicitTitle: string | null,
): {
  readonly tiktokTitle: string;
  readonly tiktokCaption: string;
} {
  const normalized = body.replace(/\r\n/g, "\n");
  const providedTitle = explicitTitle?.trim() ?? "";
  if (providedTitle) {
    return {
      tiktokTitle: providedTitle,
      tiktokCaption: normalized.trim(),
    };
  }
  const firstLine = (normalized.split("\n")[0] ?? "").trim();
  const rest = normalized.split("\n").slice(1).join("\n").trim();
  const caption = rest.length > 0 ? rest : normalized.trim();
  return { tiktokTitle: firstLine, tiktokCaption: caption };
}

export function validateComposerMainTextForJob(input: {
  readonly account: ComposerPostingAccount;
  readonly kind: "text" | "image" | "video" | "carousel" | "document";
  readonly rawBody: string;
  readonly youtubeExplicitTitle: string | null;
  readonly pinterestExplicitTitle: string | null;
  /** TikTok Business photo title field; optional for backward compatibility. */
  readonly tiktokExplicitTitle?: string | null;
}): string | null {
  const {
    account,
    kind,
    rawBody,
    youtubeExplicitTitle,
    pinterestExplicitTitle,
    tiktokExplicitTitle: tiktokExplicitTitleRaw,
  } = input;
  const tiktokExplicitTitle = tiktokExplicitTitleRaw ?? null;

  if (account.platform === "youtube") {
    if (kind === "video") {
      const { youtubeTitle, youtubeDescription } =
        deriveYoutubeTitleAndDescriptionFromBody(rawBody, youtubeExplicitTitle);
      if (youtubeTitle.length > YOUTUBE_TITLE_MAX) {
        return `${account.displayName}: YouTube title must be at most ${YOUTUBE_TITLE_MAX} characters (currently ${youtubeTitle.length}).`;
      }
      if (youtubeDescription.length > YOUTUBE_DESCRIPTION_MAX) {
        return `${account.displayName}: YouTube description must be at most ${YOUTUBE_DESCRIPTION_MAX.toLocaleString()} characters (currently ${youtubeDescription.length}).`;
      }
      return null;
    }
    const n = rawBody.trim().length;
    if (n > YOUTUBE_NON_VIDEO_CAPTION_MAX) {
      return `${account.displayName}: YouTube caption/description must be at most ${YOUTUBE_NON_VIDEO_CAPTION_MAX.toLocaleString()} characters (currently ${n}).`;
    }
    return null;
  }

  if (account.platform === "pinterest") {
    const { pinterestTitle, pinterestDescription } =
      derivePinterestTitleAndDescriptionFromBody(
        rawBody,
        pinterestExplicitTitle,
      );
    if (pinterestTitle.length > PINTEREST_TITLE_MAX) {
      return `${account.displayName}: Pinterest title must be at most ${PINTEREST_TITLE_MAX} characters (currently ${pinterestTitle.length}).`;
    }
    if (pinterestDescription.length > PINTEREST_DESCRIPTION_MAX) {
      return `${account.displayName}: Pinterest description must be at most ${PINTEREST_DESCRIPTION_MAX} characters (currently ${pinterestDescription.length}).`;
    }
    return null;
  }

  if (
    account.platform === "tiktok" &&
    (kind === "image" || kind === "carousel")
  ) {
    const { tiktokTitle, tiktokCaption } = deriveTiktokTitleAndCaptionFromBody(
      rawBody,
      tiktokExplicitTitle,
    );
    const titleUnits = utf16CodeUnits(tiktokTitle);
    if (titleUnits > TIKTOK_PHOTO_TITLE_MAX) {
      return `${account.displayName}: TikTok photo title must be at most ${TIKTOK_PHOTO_TITLE_MAX} UTF-16 code units (currently ${titleUnits}). Use the TikTok title field or shorten the first line.`;
    }
    const capUnits = utf16CodeUnits(tiktokCaption);
    const capLimit = PLATFORM_MAIN_TEXT_MAX.tiktok ?? 2200;
    if (capUnits > capLimit) {
      return `${account.displayName}: ${PLATFORM_LABEL.tiktok} allows up to ${capLimit} UTF-16 code units in the caption (currently ${capUnits}).${textModeGuidance(kind)}`;
    }
    return null;
  }

  const limit = PLATFORM_MAIN_TEXT_MAX[account.platform];
  if (limit === undefined) {
    return null;
  }

  const trimmed = rawBody.trim();
  if (account.platform === "bluesky") {
    const name = PLATFORM_LABEL.bluesky;
    const graphemes = countGraphemeClusters(trimmed);
    const bytes = utf8Bytes(trimmed);
    const maxGraphemes = limit;
    const maxBytes = 3000;
    if (graphemes > maxGraphemes) {
      return `${account.displayName}: ${name} allows up to ${maxGraphemes} graphemes in the main post text (currently ${graphemes}).${textModeGuidance(kind)}`;
    }
    if (bytes > maxBytes) {
      return `${account.displayName}: ${name} allows up to ${maxBytes.toLocaleString()} UTF-8 bytes for post text (currently ${bytes.toLocaleString()}). Shorten special characters/emojis or remove links.${textModeGuidance(kind)}`;
    }
    return null;
  }

  const n = utf16CodeUnits(trimmed);
  if (n > limit) {
    const name = PLATFORM_LABEL[account.platform] ?? account.platform;
    const unitHint =
      account.platform === "tiktok"
        ? "UTF-16 code units (TikTok Direct Post API uses this measure for captions)"
        : "characters";
    return `${account.displayName}: ${name} allows up to ${limit} ${unitHint} in the main post text (currently ${n}).${textModeGuidance(kind)}`;
  }
  return null;
}

export function describeTextLimitViolationsForSelectedAccounts(input: {
  readonly accounts: readonly ComposerPostingAccount[];
  readonly rawBody: string;
}): string | null {
  const body = input.rawBody.trim();
  if (!body) {
    return null;
  }

  const problems: string[] = [];
  for (const account of input.accounts) {
    if (account.platform === "youtube") {
      continue;
    }
    const limit = PLATFORM_MAIN_TEXT_MAX[account.platform];
    if (limit === undefined) {
      continue;
    }

    if (account.platform === "bluesky") {
      const graphemes = countGraphemeClusters(body);
      if (graphemes > limit) {
        problems.push(
          `${account.displayName} (${PLATFORM_LABEL.bluesky}: ${limit})`,
        );
      }
      continue;
    }

    const n = utf16CodeUnits(body);
    if (n > limit) {
      const label = PLATFORM_LABEL[account.platform] ?? account.platform;
      problems.push(`${account.displayName} (${label}: ${limit})`);
    }
  }

  if (problems.length === 0) {
    return null;
  }

  return `Text is over limit for: ${problems.join(", ")}. Reduce text length, deselect those platforms, or switch to Per platform specific mode to write different text per platform.`;
}
