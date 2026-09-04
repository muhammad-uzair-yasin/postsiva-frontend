import type { Metadata } from "next";
import dynamic from "next/dynamic";
import type { ReactElement } from "react";

import { WorkspaceRouteSkeleton } from "@/components/workspace/WorkspaceRouteSkeleton";

export const metadata: Metadata = {
  title: "Accounts | Postsiva",
  description: "Connected workspace accounts.",
};

const AccountsScreen = dynamic(
  () =>
    import("./_components/AccountsScreen").then((m) => ({
      default: m.AccountsScreen,
    })),
  {
    loading: () => <WorkspaceRouteSkeleton label="Loading accounts…" variant="feed" />,
  },
);

export default function AccountsPage(): ReactElement {
  return <AccountsScreen />;
}
