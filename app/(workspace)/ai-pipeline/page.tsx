import type { Metadata } from "next";
import dynamic from "next/dynamic";
import type { ReactElement } from "react";

import { FeatureGatedPage } from "@/components/billing/FeatureGatedPage";
import { WorkspaceRouteSkeleton } from "@/components/workspace/WorkspaceRouteSkeleton";

export const metadata: Metadata = {
  title: "AI agent pipeline | Postsiva",
  description:
    "Chat with the architect agent and watch content generation flow through your pipeline.",
};

const AiAgentPipelineScreen = dynamic(
  () =>
    import("./_components/AiAgentPipelineScreen").then((m) => ({
      default: m.AiAgentPipelineScreen,
    })),
  {
    loading: () => (
      <WorkspaceRouteSkeleton label="Loading AI pipeline…" variant="feed" />
    ),
  },
);

export default function AiPipelinePage(): ReactElement {
  return (
    <FeatureGatedPage feature="piva_agent_enabled" featureLabel="Piva AI Agent">
      <AiAgentPipelineScreen />
    </FeatureGatedPage>
  );
}
