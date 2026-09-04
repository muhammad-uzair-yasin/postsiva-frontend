import type { Metadata } from "next";
import { PublishedPostsScreen } from "./_components/PublishedPostsScreen";

export const metadata: Metadata = {
  title: "Published posts | Postsiva",
  description: "Browse published content and performance at a glance.",
};

export default function PublishedPage(): React.ReactElement {
  return <PublishedPostsScreen />;
}
