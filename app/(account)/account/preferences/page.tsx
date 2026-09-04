import type { Metadata } from "next";
import type { ReactElement } from "react";

import { AccountAppearanceClient } from "./_components/AccountAppearanceClient";

export const metadata: Metadata = {
  title: "Appearance | Account | Postsiva",
};

export default function AccountPreferencesPage(): ReactElement {
  return <AccountAppearanceClient />;
}
