"use client";

import type { ReactElement } from "react";

import { useTranslations } from "@/lib/i18n/WorkspaceLocaleProvider";

import { SettingsSectionPanel } from "./SettingsSectionPanel";

interface SettingsPlaceholderClientProps {
  title: string;
  beta?: boolean;
  heading: string;
  body: string;
  ctaUrl?: string;
  ctaLabel?: string;
}

export function SettingsPlaceholderClient({
  title,
  beta,
  heading,
  body,
  ctaUrl,
  ctaLabel,
}: SettingsPlaceholderClientProps): ReactElement {
  const { t } = useTranslations();

  return (
    <SettingsSectionPanel beta={beta} title={title}>
      <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.3em] text-primary">
        {t("settings.placeholderComingSoon")}
      </p>
      <h3 className="mb-3 text-2xl font-extrabold tracking-tight text-on-surface">{heading}</h3>
      <div className="rounded-xl border border-outline-variant/15 bg-surface-container-low p-4">
        <p className="text-sm leading-relaxed text-on-surface-variant">{body}</p>
        {ctaUrl && ctaLabel ? (
          <a
            href={ctaUrl}
            target="_blank"
            rel="noreferrer"
            className="mt-4 inline-flex rounded-xl bg-primary px-4 py-3 text-sm font-bold text-on-primary"
          >
            {ctaLabel}
          </a>
        ) : null}
      </div>
    </SettingsSectionPanel>
  );
}
