"use client";

import { PageIntro } from "@/components/marketing/PageIntro";
import { usePublicTranslations } from "@/lib/i18n/PublicLocaleProvider";

type Props = {
  eyebrowKey: string;
  titleKey: string;
  descriptionKey: string;
};

/** Localized page hero for marketing product pages (`/about`, `/features`, …). */
export function PageIntroLocalized({
  eyebrowKey,
  titleKey,
  descriptionKey,
}: Props): React.ReactElement {
  const { t } = usePublicTranslations();
  return (
    <PageIntro
      eyebrow={t(eyebrowKey)}
      title={t(titleKey)}
      description={t(descriptionKey)}
    />
  );
}
