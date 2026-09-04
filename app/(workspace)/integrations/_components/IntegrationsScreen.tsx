"use client";

import type { ReactElement } from "react";

import { WorkspacePageDocumentHead } from "../../_components/WorkspacePageDocumentHead";
import { WorkspacePageScaffold } from "../../_components/WorkspacePageScaffold";
import { IntegrationsListClient } from "../../settings/_components/IntegrationsListClient";

export function IntegrationsScreen(): ReactElement {
  return (
    <>
      <WorkspacePageDocumentHead
        titleKey="settings.integrationsTitle"
        descriptionKey="shell.settingsIntegrationsHint"
      />
      <WorkspacePageScaffold>
        <IntegrationsListClient />
      </WorkspacePageScaffold>
    </>
  );
}
