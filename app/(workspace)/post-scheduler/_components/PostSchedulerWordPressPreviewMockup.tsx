"use client";

import { SocialPlatformIcon } from "@/lib/social/SocialPlatformIcon";
import { useTranslations } from "@/lib/i18n/WorkspaceLocaleProvider";

import { PostSchedulerWordPressPreviewBody } from "./PostSchedulerWordPressPreviewBody";

interface PostSchedulerWordPressPreviewMockupProps {
  readonly siteName?: string;
  readonly title: string;
  readonly slug: string;
  readonly content: string;
  readonly excerpt: string;
  readonly categoryNames: readonly string[];
  readonly tagNames: readonly string[];
  readonly featuredImageUrl?: string;
  readonly imageSaving?: boolean;
  readonly loading?: boolean;
  readonly fillAvailableHeight?: boolean;
  readonly onContentChange: (html: string) => void;
  readonly onRequestAddImage: (insertAt: number) => void;
}

/** WordPress live preview — same card width as social; one scroll for the full post. */
export function PostSchedulerWordPressPreviewMockup({
  siteName,
  title,
  slug,
  content,
  excerpt,
  categoryNames,
  tagNames,
  featuredImageUrl = "",
  imageSaving = false,
  loading = false,
  fillAvailableHeight = false,
  onContentChange,
  onRequestAddImage,
}: PostSchedulerWordPressPreviewMockupProps): React.ReactElement {
  const { t } = useTranslations();
  const articleTitle = title.trim() || "Add a title";
  const articleSlug =
    slug.trim() ||
    articleTitle
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
  const excerptText = excerpt.trim();
  const heroImageUrl = featuredImageUrl.trim();
  const siteLabel = siteName?.trim() || t("postScheduler.previewMockups.postsiva");

  const scrollShellClass = fillAvailableHeight
    ? "min-h-0 flex-1 overflow-x-hidden overflow-y-auto postsiva-scrollbar"
    : "max-h-[min(70vh,40rem)] overflow-x-hidden overflow-y-auto postsiva-scrollbar";

  return (
    <div
      className={`flex w-full max-w-lg min-w-0 flex-col overflow-hidden rounded-2xl border border-outline-variant/10 bg-surface-container-lowest ${
        fillAvailableHeight ? "h-full max-h-full min-h-0" : ""
      }`}
    >
      <div className={scrollShellClass}>
        <div className="p-5">
          <div className="flex items-start gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full bg-secondary/20 ring-2 ring-secondary/30">
              <SocialPlatformIcon platform="wordpress" className="h-6 w-6" alt="" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="truncate text-base font-bold text-on-surface">{siteLabel}</div>
              <div className="truncate text-sm text-on-surface-variant">
                /{articleSlug || "post-slug"} · {t("postScheduler.previewMockups.justNowGlobe")}
              </div>
            </div>
            <span className="shrink-0 rounded-full bg-secondary/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-secondary">
              Blog
            </span>
          </div>

          {heroImageUrl ? (
            <div className="relative mt-4 overflow-hidden rounded-xl bg-surface-container-high ring-1 ring-outline-variant/10">
              {imageSaving ? (
                <div className="grid aspect-video w-full place-items-center">
                  <span className="material-symbols-outlined animate-pulse text-[32px] text-on-surface-variant">
                    image
                  </span>
                </div>
              ) : (
                // eslint-disable-next-line @next/next/no-img-element -- featured image preview URL
                <img src={heroImageUrl} alt="" className="aspect-video w-full object-cover" />
              )}
            </div>
          ) : null}

          {loading ? (
            <div className="mt-4 grid gap-2">
              <div className="h-6 w-4/5 animate-pulse rounded bg-surface-container-highest" />
              <div className="h-4 w-full animate-pulse rounded bg-surface-container-highest" />
            </div>
          ) : (
            <h2 className="mt-4 text-lg font-bold leading-snug text-on-surface">{articleTitle}</h2>
          )}

          {!loading && excerptText ? (
            <p className="mt-2 text-sm leading-relaxed text-on-surface-variant">{excerptText}</p>
          ) : null}

          {categoryNames.length > 0 || tagNames.length > 0 ? (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {categoryNames.slice(0, 3).map((name) => (
                <span
                  key={`c-${name}`}
                  className="rounded-full bg-secondary/12 px-2 py-0.5 text-[10px] font-semibold text-secondary"
                >
                  {name}
                </span>
              ))}
              {tagNames.slice(0, 4).map((name) => (
                <span
                  key={`t-${name}`}
                  className="rounded-md bg-surface-container px-2 py-0.5 text-[10px] text-on-surface-variant"
                >
                  #{name}
                </span>
              ))}
            </div>
          ) : null}

          <div className="mt-4">
            <PostSchedulerWordPressPreviewBody
              content={content}
              loading={loading}
              imageSaving={imageSaving}
              onContentChange={onContentChange}
              onRequestAddImage={onRequestAddImage}
            />
          </div>

          <div className="mt-4 flex justify-between border-t border-outline-variant/10 pt-4 text-sm text-on-surface-variant">
            <span className="flex items-center gap-2">
              <span className="material-symbols-outlined text-xl">thumb_up</span>
              {t("postScheduler.previewMockups.like")}
            </span>
            <span className="flex items-center gap-2">
              <span className="material-symbols-outlined text-xl">chat_bubble</span>
              {t("postScheduler.previewMockups.comment")}
            </span>
            <span className="flex items-center gap-2">
              <span className="material-symbols-outlined text-xl">share</span>
              {t("postScheduler.previewMockups.share")}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
