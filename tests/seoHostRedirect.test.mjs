import assert from "node:assert/strict";
import { rmSync } from "node:fs";
import { join } from "node:path";

import { bundleSeoModule } from "./seoBundle.mjs";

const outDir = join(process.cwd(), ".tmp/seo-bundle");

try {
  const redirect = bundleSeoModule("lib/seo/apexRedirect.ts", "apexRedirect.js");

  const apex = redirect.buildApexRedirectUrl("postsiva.com", "/pricing", "?x=1");
  assert.ok(apex);
  assert.equal(apex.href, "https://www.postsiva.com/pricing?x=1");

  assert.equal(redirect.buildApexRedirectUrl("www.postsiva.com", "/"), null);
  assert.equal(redirect.buildApexRedirectUrl("localhost", "/"), null);

  console.log("seoHostRedirect.test.mjs: ok");
} finally {
  rmSync(outDir, { recursive: true, force: true });
}
