import type { Metadata } from "next";
import type { ReactElement } from "react";

import { PostSchedulerAiComposerGate } from "../_components/PostSchedulerFeatureGates";
import { PostSchedulerAiAssistantScreen } from "./_components/PostSchedulerAiAssistantScreen";

export const metadata: Metadata = {
  title: "Post scheduler · AI assistant | Postsiva",
  description: "Chat with AI while previewing posts per channel.",
};

export default function PostSchedulerAiAssistantPage(): ReactElement {
  return (
    <PostSchedulerAiComposerGate>
      <PostSchedulerAiAssistantScreen />
    </PostSchedulerAiComposerGate>
  );
}
