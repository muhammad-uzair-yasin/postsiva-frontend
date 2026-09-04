import { redirect } from "next/navigation";

interface PageProps {
  params: Promise<{ slug: string }>;
}

/** @deprecated Use `/integrations/[slug]`. */
export default async function SettingsIntegrationSlugRedirectPage({
  params,
}: PageProps): Promise<never> {
  const { slug } = await params;
  redirect(`/integrations/${slug}`);
}
