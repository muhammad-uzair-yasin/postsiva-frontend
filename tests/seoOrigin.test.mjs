import assert from "node:assert/strict";
import { rmSync } from "node:fs";
import { join } from "node:path";

import { bundleSeoModule } from "./seoBundle.mjs";

const outDir = join(process.cwd(), ".tmp/seo-bundle");

try {
  const pageSeo = bundleSeoModule("lib/seo/pageSeo.ts", "pageSeo.js");
  const origin = bundleSeoModule("lib/seo/siteOrigin.ts", "siteOrigin.js");
  const meta = bundleSeoModule("lib/seo/publicPageMeta.ts", "publicPageMeta.js");

  assert.equal(origin.APEX_HOST, "postsiva.com");
  assert.equal(origin.WWW_HOST, "www.postsiva.com");
  assert.equal(origin.getCanonicalOrigin(), "https://www.postsiva.com");
  assert.equal(origin.buildCanonicalUrl("/"), "https://www.postsiva.com/");
  assert.equal(origin.buildCanonicalUrl("/pricing"), "https://www.postsiva.com/pricing");

  const home = pageSeo.buildPageMetadata({
    path: "/",
    title: meta.HOME_TITLE,
    absoluteTitle: true,
  });
  assert.equal(home.title?.absolute, meta.HOME_TITLE);
  assert.equal(home.alternates?.canonical, "https://www.postsiva.com/");
  assert.match(String(home.description), /Schedule, publish, and grow/);

  console.log("seoOrigin.test.mjs: ok");
} finally {
  rmSync(outDir, { recursive: true, force: true });
}
