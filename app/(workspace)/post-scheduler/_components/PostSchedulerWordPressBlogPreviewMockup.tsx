"use client";

import { useTranslations } from "@/lib/i18n/WorkspaceLocaleProvider";

import { PostSchedulerWordPressPreviewBody } from "./PostSchedulerWordPressPreviewBody";

/** Editorial live preview — dark shell matching workspace composer. */
export function PostSchedulerWordPressBlogPreviewMockup({
  title,
  excerpt,
  content,
  featuredImageUrl = "",
  imageSaving = false,
  loading = false,
  fillAvailableHeight = false,
  onContentChange,
  onRequestAddImage,
  onRequestCoverImage,
}: {
  readonly title: string;
  readonly excerpt: string;
  readonly content: string;
  readonly featuredImageUrl?: string;
  readonly imageSaving?: boolean;
  readonly loading?: boolean;
  readonly fillAvailableHeight?: boolean;
  readonly onContentChange: (html: string) => void;
  readonly onRequestAddImage: (insertAt: number) => void;
  readonly onRequestCoverImage: () => void;
}): React.ReactElement {
  const { t } = useTranslations();
  const articleTitle = title.trim() || t("postScheduler.composer.blogPreviewTitlePlaceholder");
  const excerptText = excerpt.trim();
  const hero = featuredImageUrl.trim();

  const scrollShell = fillAvailableHeight
    ? "min-h-0 flex-1 overflow-y-auto postsiva-scrollbar"
    : "max-h-[min(75vh,44rem)] overflow-y-auto postsiva-scrollbar";

  return (
    <div
      className={`flex w-full max-w-2xl min-w-0 flex-col overflow-hidden rounded-xl border border-outline-variant/15 bg-surface-container-lowest shadow-[0_12px_40px_rgba(0,0,0,0.35)] ring-1 ring-white/[0.04] ${
        fillAvailableHeight ? "h-full max-h-full" : ""
      }`}
    >
      <div className={scrollShell}>
        <div className="p-6 sm:p-8">
          {loading ? (
            <div className="mb-6 grid gap-3">
              <div className="h-9 w-4/5 animate-pulse rounded bg-surface-container-highest" />
              <div className="h-4 w-full animate-pulse rounded bg-surface-container-highest" />
            </div>
          ) : (
            <h1 className="mb-8 font-serif text-3xl font-bold leading-tight text-on-surface sm:text-4xl">
              {articleTitle}
            </h1>
          )}

          {hero ? (
            <button
              type="button"
              onClick={onRequestCoverImage}
              className="group relative mb-8 block w-full overflow-hidden rounded-lg bg-surface-container-high ring-1 ring-outline-variant/15"
            >
              {imageSaving ? (
                <div className="grid aspect-[2/1] w-full place-items-center text-on-surface-variant">
                  <span className="material-symbols-outlined animate-pulse text-[40px]">image</span>
                </div>
              ) : (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={hero} alt="" className="aspect-[2/1] w-full object-cover" />
              )}
              <span className="absolute inset-0 flex items-center justify-center bg-black/0 opacity-0 transition group-hover:bg-black/40 group-hover:opacity-100">
                <span className="rounded-full bg-black/60 px-3 py-1.5 text-xs font-semibold text-white">
                  {t("postScheduler.composer.blogChangeCover")}
                </span>
              </span>
            </button>
          ) : (
            <button
              type="button"
              onClick={onRequestCoverImage}
              className="mb-8 flex aspect-[2/1] w-full flex-col items-center justify-center rounded-lg border-2 border-dashed border-outline-variant/30 bg-surface-container-low/80 text-on-surface-variant transition hover:border-secondary/45 hover:bg-surface-container-low"
            >
              <span className="material-symbols-outlined mb-2 text-[2.5rem] opacity-70">photo_camera</span>
              <span className="text-sm font-medium text-secondary">
                {t("postScheduler.composer.blogPreviewAddCover")}
              </span>
            </button>
          )}

          {excerptText ? (
            <p className="mb-8 font-serif text-base leading-relaxed text-on-surface-variant">
              {excerptText}
            </p>
          ) : null}

          <div className="font-serif">
            <PostSchedulerWordPressPreviewBody
              content={content}
              loading={loading}
              imageSaving={imageSaving}
              onContentChange={onContentChange}
              onRequestAddImage={onRequestAddImage}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
