"use client";

import { MarketingMegaMenuPanel } from "@/components/marketing/MarketingMegaMenuPanel";
import { usePublicTranslations } from "@/lib/i18n/PublicLocaleProvider";
import { FEATURES_MEGA_MENU_COLUMNS } from "@/lib/marketing/megaMenuData";

type MarketingFeaturesMegaMenuProps = {
  onNavigate?: () => void;
  className?: string;
};

export function MarketingFeaturesMegaMenu({
  onNavigate,
  className = "",
}: MarketingFeaturesMegaMenuProps): React.ReactElement {
  const { t } = usePublicTranslations();

  return (
    <MarketingMegaMenuPanel
      className={className}
      columns={FEATURES_MEGA_MENU_COLUMNS}
      onNavigate={onNavigate}
      footerHref="/features"
      footerLabel={t("marketing.featuresSeeAll")}
    />
  );
}
