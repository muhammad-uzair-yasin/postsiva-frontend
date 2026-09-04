import assert from "node:assert/strict";
import { rmSync } from "node:fs";
import { join } from "node:path";

import { bundleSeoModule } from "./seoBundle.mjs";

const outDir = join(process.cwd(), ".tmp/seo-bundle");

try {
  const routes = bundleSeoModule("lib/seo/sitemapRoutes.ts", "sitemapRoutes.js");
  const paths = new Set(routes.getPublicSitemapPaths());

  for (const sample of routes.REQUIRED_SITEMAP_SAMPLES) {
    assert.ok(paths.has(sample), `missing sitemap path: ${sample}`);
  }

  assert.ok(paths.size > 50, "expected expanded public sitemap");

  console.log("seoSitemap.test.mjs: ok");
} finally {
  rmSync(outDir, { recursive: true, force: true });
}
