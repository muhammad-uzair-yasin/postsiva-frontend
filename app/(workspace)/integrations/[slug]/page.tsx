import type { Metadata } from "next";
import type { ReactElement } from "react";

import { IntegrationsGuideScreen } from "../_components/IntegrationsGuideScreen";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  return {
    title: `${slug} | Integrations | Postsiva`,
  };
}

export default async function IntegrationGuidePage({
  params,
}: PageProps): Promise<ReactElement> {
  const { slug } = await params;
  return <IntegrationsGuideScreen slug={slug} />;
}
