"use client";

import { MarketingMegaMenuPanel } from "@/components/marketing/MarketingMegaMenuPanel";
import { usePublicTranslations } from "@/lib/i18n/PublicLocaleProvider";
import { INTEGRATIONS_MEGA_MENU_COLUMNS } from "@/lib/marketing/megaMenuData";

type MarketingIntegrationsMegaMenuProps = {
  onNavigate?: () => void;
  className?: string;
};

export function MarketingIntegrationsMegaMenu({
  onNavigate,
  className = "",
}: MarketingIntegrationsMegaMenuProps): React.ReactElement {
  const { t } = usePublicTranslations();

  return (
    <MarketingMegaMenuPanel
      className={className}
      columns={INTEGRATIONS_MEGA_MENU_COLUMNS}
      onNavigate={onNavigate}
      footerHref="/integrations-explore"
      footerLabel={t("marketing.integrationsSeeAll")}
    />
  );
}
