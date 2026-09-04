"use client";

import { useMemo, useState } from "react";

import type { IntegrationStep, IntegrationTab } from "@/lib/settings/integrationsData";
import { getIntegrationBySlug } from "@/lib/settings/integrationsData";

export function useIntegrationSetup(slug: string): {
  name: string;
  subtitle: string;
  longDescription?: string;
  steps: IntegrationStep[];
  tabs: Array<IntegrationTab & { onSelect: () => void; active: boolean }>;
  prompts: string[];
  externalCta?: { label: string; url: string };
} | null {
  const integration = useMemo(() => getIntegrationBySlug(slug), [slug]);
  const [activeTabId, setActiveTabId] = useState<string | null>(null);
  const tabs = integration?.tabs;
  const effectiveTabId = activeTabId ?? tabs?.[0]?.id ?? null;
  const activeTab = tabs?.find((tab) => tab.id === effectiveTabId);

  if (!integration) {
    return null;
  }

  return {
    name: integration.name,
    subtitle: integration.subtitle ?? integration.description,
    longDescription: integration.longDescription ?? integration.description,
    steps: activeTab?.setupSteps ?? integration.setupSteps ?? [],
    tabs: (integration.tabs ?? []).map((tab) => ({
      ...tab,
      onSelect: (): void => setActiveTabId(tab.id),
      active: effectiveTabId === tab.id,
    })),
    prompts: integration.examplePrompts ?? [],
    externalCta: integration.externalCta,
  };
}
