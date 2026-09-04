import type { Metadata } from "next";
import type { ReactElement } from "react";

import { ProfileSettingsClient } from "@/app/(workspace)/settings/_components/ProfileSettingsClient";

export const metadata: Metadata = {
  title: "Profile | Account | Postsiva",
};

export default function AccountProfilePage(): ReactElement {
  return <ProfileSettingsClient />;
}
