import type { Metadata } from "next";
import type { ReactElement } from "react";

import { OnboardingConnectScreen } from "./_components/OnboardingConnectScreen";

export const metadata: Metadata = {
  title: "Connect account | Postsiva",
  robots: { index: false, follow: false },
};

export default function OnboardingConnectPage(): ReactElement {
  return <OnboardingConnectScreen />;
}
