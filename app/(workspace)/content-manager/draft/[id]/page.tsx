import type { Metadata } from "next";
import dynamic from "next/dynamic";
import type { ReactElement } from "react";

import { FeatureGatedPage } from "@/components/billing/FeatureGatedPage";
import { WorkspaceRouteSkeleton } from "@/components/workspace/WorkspaceRouteSkeleton";

interface DraftEditorPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({
  params,
}: DraftEditorPageProps): Promise<Metadata> {
  const { id } = await params;
  return {
    title: `Edit draft | Postsiva`,
    description: `Edit draft ${id.slice(0, 8)}…`,
  };
}

const DraftEditorScreen = dynamic(
  () =>
    import("./_components/DraftEditorScreen").then((m) => ({
      default: m.DraftEditorScreen,
    })),
  {
    loading: () => (
      <WorkspaceRouteSkeleton label="Loading draft editor…" variant="form" />
    ),
  },
);

export default async function DraftEditorPage({
  params,
}: DraftEditorPageProps): Promise<ReactElement> {
  const { id } = await params;
  return (
    <FeatureGatedPage feature="drafts_enabled" featureLabel="Drafts">
      <DraftEditorScreen draftId={id} />
    </FeatureGatedPage>
  );
}
