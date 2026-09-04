import type { Metadata } from "next";
import dynamic from "next/dynamic";
import type { ReactElement } from "react";

import { SettingsRouteSkeleton } from "../_components/SettingsRouteSkeleton";

export const metadata: Metadata = { title: "Preferences | Settings | Postsiva" };

const Screen = dynamic(
  () =>
    import("../_components/PreferencesSettingsClient").then((m) => ({
      default: m.PreferencesSettingsClient,
    })),
  { loading: () => <SettingsRouteSkeleton /> },
);

export default function Page(): ReactElement {
  return <Screen />;
}
