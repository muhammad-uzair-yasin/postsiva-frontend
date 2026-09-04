"use client";

import type { ReactElement, ReactNode } from "react";

import { WorkspacePageScaffold } from "../../_components/WorkspacePageScaffold";
import { IntegrationGuideClient } from "../../settings/_components/IntegrationGuideClient";
import { IntegrationGuideGated } from "../../settings/_components/IntegrationGuideGated";
import { SettingsIntegrationsStudioBackLink } from "../../settings/_components/SettingsIntegrationsStudioBackLink";

interface IntegrationsGuideScreenProps {
  readonly slug: string;
  readonly children?: ReactNode;
}

export function IntegrationsGuideScreen({
  slug,
  children,
}: IntegrationsGuideScreenProps): ReactElement {
  return (
    <WorkspacePageScaffold>
      <SettingsIntegrationsStudioBackLink />
      <IntegrationGuideGated slug={slug}>
        {children ?? <IntegrationGuideClient slug={slug} />}
      </IntegrationGuideGated>
    </WorkspacePageScaffold>
  );
}
