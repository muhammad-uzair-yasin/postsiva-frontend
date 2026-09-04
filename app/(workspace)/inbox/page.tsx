import type { Metadata } from "next";
import dynamic from "next/dynamic";
import type { ReactElement } from "react";

import { FeatureGatedPage } from "@/components/billing/FeatureGatedPage";

import { InboxRouteLoading } from "./_components/InboxRouteLoading";

const SocialInboxScreen = dynamic(
  () =>
    import("./_components/SocialInboxScreen").then((mod) => ({
      default: mod.SocialInboxScreen,
    })),
  {
    loading: () => <InboxRouteLoading />,
  },
);

export const metadata: Metadata = {
  title: "Social Inbox | Postsiva",
  description: "Comments and messages across your connected channels.",
};

export default function InboxPage(): ReactElement {
  return (
    <FeatureGatedPage feature="inbox_enabled">
      <SocialInboxScreen />
    </FeatureGatedPage>
  );
}
