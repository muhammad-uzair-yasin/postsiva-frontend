import { LandingPage } from "@/components/marketing/LandingPage";
import { buildPageMetadata } from "@/lib/seo/pageSeo";
import { HOME_TITLE } from "@/lib/seo/publicPageMeta";

export const metadata = buildPageMetadata({
  path: "/",
  title: HOME_TITLE,
  absoluteTitle: true,
});

export default function Home(): React.ReactElement {
  return <LandingPage />;
}
