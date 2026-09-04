"use client";

import type { ReactElement } from "react";

import { WorkspacePageDocumentHead } from "../../_components/WorkspacePageDocumentHead";
import { WorkspacePageScaffold } from "../../_components/WorkspacePageScaffold";
import { ReferEarnContent } from "./ReferEarnContent";

export function ReferralsScreen(): ReactElement {
  return (
    <>
      <WorkspacePageDocumentHead titleKey="nav.referEarn" />
      <WorkspacePageScaffold>
        <ReferEarnContent />
      </WorkspacePageScaffold>
    </>
  );
}
