import type { Metadata } from "next";
import dynamic from "next/dynamic";
import type { ReactElement } from "react";

import { FeatureGatedPage } from "@/components/billing/FeatureGatedPage";
import { SettingsRouteSkeleton } from "../_components/SettingsRouteSkeleton";

export const metadata: Metadata = {
  title: "Instagram DM | Settings | Postsiva",
  description: "Connect the Postsiva workspace agent via Instagram direct messages.",
};

const SocialDmIntegrationSettingsClient = dynamic(
  () =>
    import("../_components/SocialDmIntegrationSettingsClient").then((m) => ({
      default: m.SocialDmIntegrationSettingsClient,
    })),
  { loading: () => <SettingsRouteSkeleton /> },
);

export default function SettingsInstagramDmPage(): ReactElement {
  return (
    <FeatureGatedPage feature="instagram_dm_enabled" featureLabel="Instagram DM">
      <SocialDmIntegrationSettingsClient channel="instagram-dm" />
    </FeatureGatedPage>
  );
}
