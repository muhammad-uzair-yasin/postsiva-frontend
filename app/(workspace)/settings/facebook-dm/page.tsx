import type { Metadata } from "next";
import dynamic from "next/dynamic";
import type { ReactElement } from "react";

import { FeatureGatedPage } from "@/components/billing/FeatureGatedPage";
import { SettingsRouteSkeleton } from "../_components/SettingsRouteSkeleton";

export const metadata: Metadata = {
  title: "Facebook DM | Settings | Postsiva",
  description: "Connect the Postsiva workspace agent via Facebook Page messages.",
};

const SocialDmIntegrationSettingsClient = dynamic(
  () =>
    import("../_components/SocialDmIntegrationSettingsClient").then((m) => ({
      default: m.SocialDmIntegrationSettingsClient,
    })),
  { loading: () => <SettingsRouteSkeleton /> },
);

export default function SettingsFacebookDmPage(): ReactElement {
  return (
    <FeatureGatedPage feature="facebook_dm_enabled" featureLabel="Facebook DM">
      <SocialDmIntegrationSettingsClient channel="facebook-dm" />
    </FeatureGatedPage>
  );
}
