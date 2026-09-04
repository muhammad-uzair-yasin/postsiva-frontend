import type { ComposerChannelAccount } from "../_data/postSchedulerComposerChannelAccounts";
import type { ComposerDraftScope } from "../_types/composerDraftTypes";
import type { SocialPlatformIconId } from "@/lib/social/socialPlatformIconSrc";

/** Maps header/composer icon id → unified AI API platform slug. */
export function composerIconToAiApiPlatform(icon: SocialPlatformIconId): string {
  if (icon === "x") {
    return "threads";
  }
  return icon;
}

export type PostSchedulerAiPlatformResolution =
  | {
      readonly ok: true;
      /** For `generateUnifiedContent` / `generateUnifiedImage` `platforms` array. */
      readonly contentPlatforms: string[];
      /** For endpoints that take a single `platform` string. */
      readonly singlePlatform: string;
      /** LinkedIn / FB page id when the active row is a page destination. */
      readonly pageId: string | undefined;
    }
  | { readonly ok: false; readonly message: string };

/**
 * "Same for all" → `all`; per-post tab → that channel’s platform (+ optional `page_id`).
 */
export function resolvePostSchedulerAiPlatforms(input: {
  readonly draftScope: ComposerDraftScope;
  readonly activeChannelId: string | null;
  readonly selectedAccounts: readonly ComposerChannelAccount[];
}): PostSchedulerAiPlatformResolution {
  if (input.draftScope === "all_channels") {
    const selectedPlatforms = Array.from(
      new Set(
        input.selectedAccounts
          .map((account) => composerIconToAiApiPlatform(account.platform))
          .filter((platform) => platform.length > 0),
      ),
    );
    if (selectedPlatforms.length === 1 && selectedPlatforms[0] === "wordpress") {
      return {
        ok: true,
        contentPlatforms: ["wordpress"],
        singlePlatform: "wordpress",
        pageId: undefined,
      };
    }
    return {
      ok: true,
      contentPlatforms: ["all"],
      singlePlatform: "all",
      pageId: undefined,
    };
  }
  if (!input.activeChannelId) {
    return {
      ok: false,
      message: "Select a channel tab first (Per-post draft).",
    };
  }
  const acc = input.selectedAccounts.find((a) => a.id === input.activeChannelId);
  if (!acc) {
    return {
      ok: false,
      message: "Select a channel tab first (Per-post draft).",
    };
  }
  const slug = composerIconToAiApiPlatform(acc.platform);
  const pageId = acc.targetResourceId?.trim() || undefined;
  return {
    ok: true,
    contentPlatforms: [slug],
    singlePlatform: slug,
    pageId,
  };
}
