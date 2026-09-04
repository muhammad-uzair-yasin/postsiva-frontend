import type { Metadata } from "next";
import dynamic from "next/dynamic";
import type { ReactElement } from "react";

import { WorkspaceRouteSkeleton } from "@/components/workspace/WorkspaceRouteSkeleton";

export const metadata: Metadata = {
  title: "Refer & Earn | Postsiva",
  description: "Share Postsiva and earn referral rewards.",
};

const ReferralsScreen = dynamic(
  () =>
    import("./_components/ReferralsScreen").then((m) => ({
      default: m.ReferralsScreen,
    })),
  {
    loading: () => <WorkspaceRouteSkeleton label="Loading referrals…" variant="form" />,
  },
);

export default function ReferralsPage(): ReactElement {
  return <ReferralsScreen />;
}
