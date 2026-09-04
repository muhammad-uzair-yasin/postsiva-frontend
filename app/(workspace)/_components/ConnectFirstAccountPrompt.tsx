"use client";

import type { ReactElement } from "react";

import { useTranslations } from "@/lib/i18n/WorkspaceLocaleProvider";
import { SocialPlatformIcon } from "@/lib/social/SocialPlatformIcon";
import type { SocialPlatformIconId } from "@/lib/social/socialPlatformIconSrc";

const PREVIEW_PLATFORMS: readonly SocialPlatformIconId[] = [
  "instagram",
  "linkedin",
  "youtube",
  "facebook",
  "tiktok",
  "pinterest",
];

type ConnectFirstAccountPromptProps = {
  readonly variant: "banner" | "hero";
  readonly onConnect: () => void;
};

function PlatformPreviewRow(): ReactElement {
  return (
    <div className="flex flex-wrap items-center gap-2" aria-hidden>
      {PREVIEW_PLATFORMS.map((platform) => (
        <span
          key={platform}
          className="flex h-9 w-9 items-center justify-center rounded-xl border border-outline-variant/15 bg-surface/80 shadow-sm ring-1 ring-white/5"
        >
          <SocialPlatformIcon platform={platform} className="h-5 w-5" alt="" />
        </span>
      ))}
    </div>
  );
}

function ConnectButton({
  label,
  onConnect,
  className = "",
}: {
  readonly label: string;
  readonly onConnect: () => void;
  readonly className?: string;
}): ReactElement {
  return (
    <button
      type="button"
      onClick={onConnect}
      className={[
        "inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-bold text-on-primary shadow-lg shadow-primary/20 transition hover:brightness-110 active:scale-[0.98]",
        className,
      ].join(" ")}
    >
      <span className="material-symbols-outlined text-[20px]">hub</span>
      {label}
      <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
    </button>
  );
}

export function ConnectFirstAccountPrompt({
  variant,
  onConnect,
}: ConnectFirstAccountPromptProps): ReactElement {
  const { t } = useTranslations();

  if (variant === "hero") {
    return (
      <section
        className="flex min-h-[min(70dvh,640px)] flex-col items-center justify-center px-4 py-12 sm:px-8"
        aria-labelledby="connect-first-account-title"
      >
        <div className="relative w-full max-w-3xl overflow-hidden rounded-3xl border border-outline-variant/15 bg-surface-container-low shadow-[0_28px_80px_-32px_rgba(0,0,0,0.65)] ring-1 ring-white/5">
          <div
            className="pointer-events-none absolute inset-0 opacity-40"
            style={{
              background:
                "radial-gradient(ellipse 80% 60% at 50% -10%, rgba(107, 73, 216, 0.45) 0%, transparent 70%)",
            }}
            aria-hidden
          />
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage:
                "linear-gradient(to right, currentColor 1px, transparent 1px), linear-gradient(to bottom, currentColor 1px, transparent 1px)",
              backgroundSize: "24px 24px",
            }}
            aria-hidden
          />
          <div className="relative z-10 flex flex-col items-center px-6 py-10 text-center sm:px-10 sm:py-14">
            <span className="rounded-full border border-secondary/25 bg-secondary/10 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.14em] text-secondary">
              {t("dashboard.firstAccountBannerEyebrow")}
            </span>
            <h1
              id="connect-first-account-title"
              className="mt-5 font-headline text-3xl font-bold tracking-tight text-on-surface sm:text-4xl"
            >
              {t("dashboard.connectFirstTitle")}
            </h1>
            <p className="mt-4 max-w-xl text-sm leading-relaxed text-on-surface-variant sm:text-base">
              {t("dashboard.connectFirstBody")}
            </p>
            <div className="mt-8">
              <PlatformPreviewRow />
            </div>
            <ConnectButton
              label={t("dashboard.firstAccountBannerCta")}
              onConnect={onConnect}
              className="mt-8"
            />
          </div>
        </div>
      </section>
    );
  }

  return (
    <div
      className="relative overflow-hidden rounded-2xl border border-outline-variant/15 bg-surface-container-low/95 shadow-[0_16px_48px_-24px_rgba(0,0,0,0.55)] ring-1 ring-white/5 backdrop-blur-xl"
      role="status"
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-50"
        style={{
          background:
            "linear-gradient(135deg, rgba(107, 73, 216, 0.14) 0%, transparent 42%, rgba(45, 212, 191, 0.08) 100%)",
        }}
        aria-hidden
      />
      <div className="relative z-10 flex flex-col gap-6 p-5 sm:p-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex min-w-0 gap-4">
          <div className="hidden w-1 shrink-0 rounded-full bg-gradient-to-b from-secondary via-primary to-secondary sm:block" />
          <div className="min-w-0">
            <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-secondary">
              {t("dashboard.firstAccountBannerEyebrow")}
            </p>
            <h2 className="mt-1 font-headline text-lg font-bold tracking-tight text-on-surface sm:text-xl">
              {t("dashboard.connectFirstTitle")}
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-on-surface-variant">
              {t("dashboard.firstAccountBannerBody")}
            </p>
            <div className="mt-4">
              <PlatformPreviewRow />
            </div>
          </div>
        </div>
        <ConnectButton
          label={t("dashboard.firstAccountBannerCta")}
          onConnect={onConnect}
          className="w-full shrink-0 lg:w-auto"
        />
      </div>
    </div>
  );
}
