"use client";

import { PublicLocaleBoundary } from "@/components/i18n/PublicLocaleBoundary";
import { LandingAssistantFabIdle } from "@/components/marketing/LandingAssistantFabIdle";

interface HelpCenterFrameClientProps {
  readonly children: React.ReactNode;
}

export function HelpCenterFrameClient({
  children,
}: HelpCenterFrameClientProps): React.ReactElement {
  return (
    <PublicLocaleBoundary>
      <div className="flex min-h-screen flex-col bg-white font-[family-name:var(--font-body)] text-[#111827] selection:bg-[#d8e2ff] selection:text-[#001a41]">
        {children}
        <LandingAssistantFabIdle />
      </div>
    </PublicLocaleBoundary>
  );
}
