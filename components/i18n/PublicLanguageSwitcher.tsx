"use client";

import { usePublicTranslations } from "@/lib/i18n/PublicLocaleProvider";
import type { PublicLocale } from "@/lib/i18n/publicLocaleStorage";
import { cn } from "@/lib/cn";

type Props = {
  className?: string;
  /** Smaller control for dense auth headers */
  compact?: boolean;
};

export function PublicLanguageSwitcher({
  className,
  compact = false,
}: Props): React.ReactElement {
  const { locale, setLocale, localeOptions, t } = usePublicTranslations();

  return (
    <div
      className={cn(
        "inline-flex items-center gap-1 rounded-full border border-outline-variant/25 bg-surface-container/80 p-0.5",
        className,
      )}
      role="group"
      aria-label={t("auth.language")}
    >
      {localeOptions.map((opt) => {
        const active = locale === opt.value;
        const short = opt.value.toUpperCase();
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => setLocale(opt.value as PublicLocale)}
            className={cn(
              "rounded-full font-bold transition-colors",
              compact ? "px-2.5 py-1 text-[10px]" : "px-3 py-1.5 text-xs",
              active
                ? "bg-primary text-on-primary shadow"
                : "text-on-surface-variant hover:text-on-surface",
            )}
            aria-pressed={active}
          >
            {short}
          </button>
        );
      })}
    </div>
  );
}
