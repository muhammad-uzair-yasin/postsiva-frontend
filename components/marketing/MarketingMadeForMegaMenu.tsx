"use client";

import { MarketingMegaMenuPanel } from "@/components/marketing/MarketingMegaMenuPanel";
import { MADE_FOR_MEGA_MENU_COLUMNS } from "@/lib/marketing/megaMenuData";

type MarketingMadeForMegaMenuProps = {
  onNavigate?: () => void;
  className?: string;
};

export function MarketingMadeForMegaMenu({
  onNavigate,
  className = "",
}: MarketingMadeForMegaMenuProps): React.ReactElement {
  return (
    <MarketingMegaMenuPanel
      className={className}
      columns={MADE_FOR_MEGA_MENU_COLUMNS}
      onNavigate={onNavigate}
      footerHref="/made-for"
      footerLabel="Explore audiences"
    />
  );
}
