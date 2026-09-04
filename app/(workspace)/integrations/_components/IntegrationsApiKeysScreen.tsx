"use client";

import type { ReactElement } from "react";

import { WorkspacePageDocumentHead } from "../../_components/WorkspacePageDocumentHead";
import { WorkspacePageScaffold } from "../../_components/WorkspacePageScaffold";
import { ApiKeysSettingsClient } from "../../settings/_components/ApiKeysSettingsClient";
import { SettingsIntegrationsStudioBackLink } from "../../settings/_components/SettingsIntegrationsStudioBackLink";

export function IntegrationsApiKeysScreen(): ReactElement {
  return (
    <>
      <WorkspacePageDocumentHead
        titleKey="settings.apiKeys"
        descriptionKey="shell.settingsApiKeysHint"
      />
      <WorkspacePageScaffold>
        <SettingsIntegrationsStudioBackLink />
        <ApiKeysSettingsClient />
      </WorkspacePageScaffold>
    </>
  );
}
