import type { Metadata } from "next";
import type { ReactElement, ReactNode } from "react";

import { SettingsLayoutClient } from "./_components/SettingsLayoutClient";

export const metadata: Metadata = {
  title: "Settings | Postsiva",
  description: "Workspace settings, profile, integrations, and connections.",
};

export default function SettingsLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>): ReactElement {
  return <SettingsLayoutClient>{children}</SettingsLayoutClient>;
}
