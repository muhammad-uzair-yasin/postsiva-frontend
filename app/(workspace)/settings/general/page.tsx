import type { Metadata } from "next";
import dynamic from "next/dynamic";
import type { ReactElement } from "react";

import { SettingsRouteSkeleton } from "../_components/SettingsRouteSkeleton";

export const metadata: Metadata = { title: "General | Workspace Settings | Postsiva" };

const Screen = dynamic(
  () =>
    import("../_components/WorkspaceGeneralSettingsClient").then((m) => ({
      default: m.WorkspaceGeneralSettingsClient,
    })),
  { loading: () => <SettingsRouteSkeleton /> },
);

export default function Page(): ReactElement {
  return <Screen />;
}
