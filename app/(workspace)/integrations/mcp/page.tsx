import type { Metadata } from "next";
import type { ReactElement } from "react";

import { FeatureGatedPage } from "@/components/billing/FeatureGatedPage";

import { IntegrationsGuideScreen } from "../_components/IntegrationsGuideScreen";
import { IntegrationGuideClient } from "../../settings/_components/IntegrationGuideClient";

export const metadata: Metadata = {
  title: "MCP | Integrations | Postsiva",
};

export default function IntegrationsMcpPage(): ReactElement {
  return (
    <FeatureGatedPage feature="mcp_enabled" featureLabel="MCP Server">
      <IntegrationsGuideScreen slug="mcp">
        <IntegrationGuideClient slug="mcp" />
      </IntegrationsGuideScreen>
    </FeatureGatedPage>
  );
}
