import type { Metadata } from "next";
import type { ReactElement } from "react";

import { OnboardingWorkspaceScreen } from "./_components/OnboardingWorkspaceScreen";

export const metadata: Metadata = {
  title: "Create workspace | Postsiva",
  robots: { index: false, follow: false },
};

export default function OnboardingWorkspacePage(): ReactElement {
  return <OnboardingWorkspaceScreen />;
}
