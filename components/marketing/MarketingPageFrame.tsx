"use client";

import { AmbientBackground } from "@/components/marketing/AmbientBackground";
import { PublicLocaleBoundary } from "@/components/i18n/PublicLocaleBoundary";

interface MarketingPageFrameProps {
  readonly children: React.ReactNode;
}

/**
 * Landing + marketing subpages: consistent background, z-stacking, overflow control.
 */
export function MarketingPageFrame({
  children,
}: MarketingPageFrameProps): React.ReactElement {
  return (
    <PublicLocaleBoundary>
      <div className="app-viewport relative min-h-screen w-full min-w-0 max-w-full overflow-x-clip bg-surface-container-lowest font-[family-name:var(--font-body)] text-on-surface">
        <AmbientBackground variant="marketing" />
        <div className="relative z-10">{children}</div>
      </div>
    </PublicLocaleBoundary>
  );
}
