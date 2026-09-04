"use client";

import Link from "next/link";
import type { ReactElement } from "react";

import { useTranslations } from "@/lib/i18n/WorkspaceLocaleProvider";

import { SettingsIntegrationsStudioBackLink } from "./SettingsIntegrationsStudioBackLink";
import { SettingsSectionPanel } from "./SettingsSectionPanel";

export type SocialDmIntegrationChannel = "instagram-dm" | "facebook-dm";

const COPY: Record<
  SocialDmIntegrationChannel,
  { titleKey: string; introKey: string; stepKeys: readonly string[] }
> = {
  "instagram-dm": {
    titleKey: "settings.socialDmInstagramTitle",
    introKey: "settings.socialDmInstagramIntro",
    stepKeys: [
      "settings.socialDmInstagramStep1",
      "settings.socialDmInstagramStep2",
      "settings.socialDmInstagramStep3",
      "settings.socialDmInstagramStep4",
    ],
  },
  "facebook-dm": {
    titleKey: "settings.socialDmFacebookTitle",
    introKey: "settings.socialDmFacebookIntro",
    stepKeys: [
      "settings.socialDmFacebookStep1",
      "settings.socialDmFacebookStep2",
      "settings.socialDmFacebookStep3",
      "settings.socialDmFacebookStep4",
    ],
  },
};

export function SocialDmIntegrationSettingsClient({
  channel,
}: {
  channel: SocialDmIntegrationChannel;
}): ReactElement {
  const { t } = useTranslations();
  const { titleKey, introKey, stepKeys } = COPY[channel];

  return (
    <div>
      <SettingsIntegrationsStudioBackLink />
      <SettingsSectionPanel title={t(titleKey)}>
      <p className="text-sm leading-relaxed text-on-surface-variant">{t(introKey)}</p>

      <ol className="mt-6 list-decimal space-y-4 pl-5 text-sm leading-relaxed text-on-surface">
        {stepKeys.map((stepKey) => (
          <li key={stepKey}>{t(stepKey)}</li>
        ))}
      </ol>

      <div className="mt-8 rounded-2xl border border-outline-variant/15 bg-surface-container-low p-4">
        <p className="text-sm font-bold text-on-surface">{t("settings.socialDmApiKeyTitle")}</p>
        <p className="mt-2 text-sm leading-relaxed text-on-surface-variant">
          {t("settings.socialDmApiKeyBodyPrefix")}{" "}
          <Link
            href="/integrations/api-keys"
            className="font-bold text-primary underline-offset-2 hover:underline"
          >
            {t("settings.apiKeys")}
          </Link>
          . {t("settings.socialDmApiKeyBodySuffix")}
        </p>
      </div>
      </SettingsSectionPanel>
    </div>
  );
}
