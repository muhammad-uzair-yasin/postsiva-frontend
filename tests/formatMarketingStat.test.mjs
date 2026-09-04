import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { mkdtempSync, readFileSync, rmSync, writeFileSync, mkdirSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";

const outDir = mkdtempSync(join(tmpdir(), "postsiva-format-marketing-stat-"));
const require = createRequire(import.meta.url);
const ts = require("typescript");

function transpileTo(outFile, sourcePath) {
  const compiled = ts.transpileModule(readFileSync(sourcePath, "utf8"), {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2020,
    },
  });
  const outPath = join(outDir, outFile);
  mkdirSync(dirname(outPath), { recursive: true });
  writeFileSync(outPath, compiled.outputText);
}

try {
  mkdirSync(join(outDir, "lib/api"), { recursive: true });
  writeFileSync(
    join(outDir, "lib/api/config.js"),
    `"use strict";\nexports.getApiBaseUrl = () => "http://localhost";\n`,
  );

  const source = readFileSync("lib/marketing/platformStatsApi.ts", "utf8").replace(
    '@/lib/api/config',
    "../api/config",
  );
  writeFileSync(join(outDir, "platformStatsApi.ts"), source);
  transpileTo("lib/marketing/platformStatsApi.js", join(outDir, "platformStatsApi.ts"));

  const { formatMarketingStat } = require(join(outDir, "lib/marketing/platformStatsApi.js"));

  assert.equal(formatMarketingStat(892), "892");
  assert.equal(formatMarketingStat(1000), "1,000");
  assert.equal(formatMarketingStat(1800), "1,800");
  assert.equal(formatMarketingStat(69295), "69,295");
  assert.equal(formatMarketingStat(1_000_000), "1,000,000");
  assert.equal(formatMarketingStat(-5), "0");
  assert.equal(formatMarketingStat(Number.NaN), "0");
  assert.equal(formatMarketingStat(1000.6), "1,001");

  console.log("formatMarketingStat.test.mjs: ok");
} finally {
  rmSync(outDir, { recursive: true, force: true });
}
