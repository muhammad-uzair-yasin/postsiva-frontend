import type { Metadata } from "next";
import dynamic from "next/dynamic";
import type { ReactElement } from "react";

import { SettingsRouteSkeleton } from "../_components/SettingsRouteSkeleton";

export const metadata: Metadata = { title: "Notifications | Settings | Postsiva" };

const Screen = dynamic(
  () =>
    import("../_components/EmailNotificationSettingsClient").then((m) => ({
      default: m.EmailNotificationSettingsClient,
    })),
  { loading: () => <SettingsRouteSkeleton /> },
);

export default function Page(): ReactElement {
  return <Screen />;
}
