import { execFileSync } from "node:child_process";
import { createRequire } from "node:module";
import { mkdirSync } from "node:fs";
import { join } from "node:path";

const require = createRequire(import.meta.url);

/** Bundle a TS module (path aliases) for node tests via esbuild. */
export function bundleSeoModule(entryRelativePath, outBasename) {
  const cwd = process.cwd();
  const outDir = join(cwd, ".tmp/seo-bundle");
  mkdirSync(outDir, { recursive: true });
  const outfile = join(outDir, outBasename);

  execFileSync(
    "npx",
    [
      "esbuild",
      entryRelativePath,
      "--bundle",
      "--platform=node",
      "--format=cjs",
      `--outfile=${outfile}`,
      "--tsconfig=tsconfig.json",
    ],
    { stdio: "inherit", cwd },
  );

  return require(outfile);
}
