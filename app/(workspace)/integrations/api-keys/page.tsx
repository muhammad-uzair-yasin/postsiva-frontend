import type { Metadata } from "next";
import type { ReactElement } from "react";

import { FeatureGatedPage } from "@/components/billing/FeatureGatedPage";

import { IntegrationsApiKeysScreen } from "../_components/IntegrationsApiKeysScreen";

export const metadata: Metadata = {
  title: "API Keys | Integrations | Postsiva",
};

export default function IntegrationsApiKeysPage(): ReactElement {
  return (
    <FeatureGatedPage feature="api_keys_enabled" featureLabel="API Keys">
      <IntegrationsApiKeysScreen />
    </FeatureGatedPage>
  );
}
