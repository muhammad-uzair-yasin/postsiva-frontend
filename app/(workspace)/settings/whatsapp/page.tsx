import type { Metadata } from "next";
import dynamic from "next/dynamic";
import type { ReactElement } from "react";

import { FeatureGatedPage } from "@/components/billing/FeatureGatedPage";
import { SettingsRouteSkeleton } from "../_components/SettingsRouteSkeleton";

export const metadata: Metadata = {
  title: "WhatsApp | Settings | Postsiva",
};

const WhatsappSettingsClient = dynamic(
  () =>
    import("../_components/WhatsappSettingsClient").then((m) => ({
      default: m.WhatsappSettingsClient,
    })),
  { loading: () => <SettingsRouteSkeleton /> },
);

export default function SettingsWhatsappPage(): ReactElement {
  return (
    <FeatureGatedPage feature="whatsapp_agent_enabled" featureLabel="WhatsApp Agent">
      <WhatsappSettingsClient />
    </FeatureGatedPage>
  );
}
