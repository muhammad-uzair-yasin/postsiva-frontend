import type { NextConfig } from "next";
import path from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = path.dirname(fileURLToPath(import.meta.url));
const releaseId = getSafeReleaseId();

function getSafeReleaseId(): string | undefined {
  const value =
    process.env.POSTSIVA_RELEASE ??
    process.env.GITHUB_SHA ??
    process.env.COMMIT_SHA;
  const normalized = value?.trim();

  return normalized && /^[a-zA-Z0-9._-]{1,128}$/.test(normalized)
    ? normalized
    : undefined;
}

const nextConfig: NextConfig = {
  poweredByHeader: false,
  // Allow Next.js <Image> to load from any external domain (news article images)
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**" },
      { protocol: "http", hostname: "**" },
    ],
    formats: ["image/avif", "image/webp"],
  },
  experimental: {
    optimizePackageImports: ["lucide-react", "framer-motion"],
  },
  // Production / file tracing — keep assets rooted in this app
  outputFileTracingRoot: projectRoot,
  // Next includes this identifier in requests so mixed-version responses can
  // be detected while Blue and Green overlap.
  deploymentId: releaseId,
  // Rolling releases must provide the same NEXT_SERVER_ACTIONS_ENCRYPTION_KEY
  // to both slots. Next reads it directly; do not add it to `env`, which would
  // inline the secret into client bundles.

  async redirects() {
    return [
      {
        source: "/docs",
        destination: "https://docs.postsiva.com/introduction",
        permanent: false,
      },
      {
        source: "/docs/:path*",
        destination: "https://docs.postsiva.com/:path*",
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
