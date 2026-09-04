import type { Metadata } from "next";
import { FeedbackScreen } from "./_components/FeedbackScreen";

export const metadata: Metadata = {
  title: "Feedback & support | Postsiva",
  description:
    "Share bugs, ideas, and improvements—your feedback shapes Postsiva.",
};

export default function FeedbackPage(): React.ReactElement {
  return <FeedbackScreen />;
}
