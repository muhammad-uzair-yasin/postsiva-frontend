import type { Metadata } from "next";
import { AddMemberScreen } from "./_components/AddMemberScreen";

export const metadata: Metadata = {
  title: "Invite workspace member | Postsiva",
  description: "Invite a teammate to your workspace.",
};

export default function AddWorkspaceMemberPage(): React.ReactElement {
  return <AddMemberScreen />;
}
