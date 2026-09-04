import type { Metadata } from "next";
import dynamic from "next/dynamic";
import type { ReactElement } from "react";

import { FeatureGatedPage } from "@/components/billing/FeatureGatedPage";
import { SettingsRouteSkeleton } from "../_components/SettingsRouteSkeleton";

export const metadata: Metadata = {
  title: "Brand Voice | Workspace Settings | Postsiva",
};

const BrandPersonaSettingsClient = dynamic(
  () =>
    import("../_components/BrandPersonaSettingsClient").then((m) => ({
      default: m.BrandPersonaSettingsClient,
    })),
  { loading: () => <SettingsRouteSkeleton /> },
);

export default function SettingsPersonaPage(): ReactElement {
  return (
    <FeatureGatedPage feature="personas_enabled" featureLabel="Brand Voice">
      <BrandPersonaSettingsClient />
    </FeatureGatedPage>
  );
}
