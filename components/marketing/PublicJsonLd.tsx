import { DEFAULT_PUBLIC_DESCRIPTION } from "@/lib/seo/publicPageMeta";
import { getCanonicalOrigin } from "@/lib/seo/siteOrigin";

export function PublicJsonLd(): React.ReactElement {
  const origin = getCanonicalOrigin();
  const payload = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        name: "Postsiva",
        url: origin,
        logo: `${origin}/favicon/android-chrome-192x192.png`,
      },
      {
        "@type": "SoftwareApplication",
        name: "Postsiva",
        applicationCategory: "BusinessApplication",
        operatingSystem: "Web",
        url: origin,
        description: DEFAULT_PUBLIC_DESCRIPTION,
      },
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(payload) }}
    />
  );
}
