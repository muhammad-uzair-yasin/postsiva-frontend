import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { mkdtempSync, readFileSync, rmSync, writeFileSync, mkdirSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";

const outDir = mkdtempSync(join(tmpdir(), "postsiva-open-canva-"));
const require = createRequire(import.meta.url);
const ts = require("typescript");

function transpileTo(relOut, sourceText) {
  const compiled = ts.transpileModule(sourceText, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2020,
    },
  });
  const outPath = join(outDir, relOut);
  mkdirSync(dirname(outPath), { recursive: true });
  writeFileSync(outPath, compiled.outputText);
}

try {
  mkdirSync(join(outDir, "lib/auth"), { recursive: true });
  mkdirSync(join(outDir, "lib/social"), { recursive: true });

  writeFileSync(
    join(outDir, "lib/auth/session.js"),
    `"use strict";
exports.getStoredAccessToken = () => "tok";
exports.getStoredActiveWorkspaceId = () => "ws";
`,
  );
  writeFileSync(
    join(outDir, "lib/social/canvaApi.js"),
    `"use strict";
exports.prepareCanvaDesignEdit = async () =>
  "https://www.canva.com/api/design/tok/edit?correlation_state=abc123";
`,
  );
  writeFileSync(
    join(outDir, "lib/social/canvaOrigin.js"),
    `"use strict";
exports.buildCanvaPopupName = (origin, sessionId) =>
  "postsiva-canva-edit|session=" + encodeURIComponent(sessionId) + "|origin=" + encodeURIComponent(origin);
`,
  );
  writeFileSync(
    join(outDir, "lib/social/canvaReturnHandoff.js"),
    `"use strict";
exports.CANVA_RETURN_SESSION_STORAGE_KEY = "postsiva:canva:return-session-id";
exports.CANVA_REPLACE_MEDIA_KEY_STORAGE = "postsiva:canva:replace-media-key";
`,
  );
  writeFileSync(
    join(outDir, "lib/social/canvaOpenFromMediaApi.js"),
    `"use strict";
exports.openPostsivaMediaInCanva = async () => ({
  designId: "DAF-FROM-MEDIA",
  editUrl: "https://www.canva.com/api/design/tok/edit?correlation_state=frommedia",
  assetOnCanvas: true,
});
`,
  );

  const source = readFileSync("lib/social/openCanvaDesignEditor.ts", "utf8")
    .replaceAll("@/lib/auth/session", "../auth/session")
    .replaceAll("@/lib/social/canvaApi", "./canvaApi")
    .replaceAll("@/lib/social/canvaOpenFromMediaApi", "./canvaOpenFromMediaApi")
    .replaceAll("@/lib/social/canvaOrigin", "./canvaOrigin")
    .replaceAll("@/lib/social/canvaReturnHandoff", "./canvaReturnHandoff");
  transpileTo("lib/social/openCanvaDesignEditor.js", source);

  const opened = [];
  const storage = new Map();
  globalThis.window = {
    location: { origin: "https://www.postsiva.com", hostname: "www.postsiva.com" },
    sessionStorage: {
      setItem(k, v) {
        storage.set(k, v);
      },
      getItem(k) {
        return storage.get(k) ?? null;
      },
      removeItem(k) {
        storage.delete(k);
      },
    },
    screen: { availWidth: 1600, availHeight: 900 },
    outerWidth: 1400,
    outerHeight: 800,
    screenX: 0,
    screenY: 0,
    open(url, name, features) {
      opened.push({ url, name, features });
      return { closed: false };
    },
  };

  const { openCanvaDesignEditor, openComposerMediaInCanva } = require(
    join(outDir, "lib/social/openCanvaDesignEditor.js"),
  );
  await openCanvaDesignEditor({ designId: "DAF123" });

  assert.equal(opened.length, 1);
  assert.equal(opened[0].name, "postsiva-canva-edit");
  assert.match(opened[0].url, /correlation_state=abc123/);

  opened.length = 0;
  globalThis.window.location = { origin: "http://localhost:3000", hostname: "localhost" };
  await openCanvaDesignEditor({ designId: "DAF456" });
  assert.equal(opened.length, 1);
  assert.match(opened[0].name, /^postsiva-canva-edit\|session=/);
  assert.match(opened[0].name, /origin=/);

  opened.length = 0;
  await openComposerMediaInCanva({
    publicUrl: "https://cdn.example/pic.png",
    mediaType: "image",
    mediaId: "m1",
  });
  assert.equal(opened.length, 1);
  assert.match(opened[0].url, /correlation_state=frommedia/);
  assert.equal(storage.get("postsiva:canva:replace-media-key"), "m1");

  console.log("openCanvaDesignEditor.test.mjs: ok");
} finally {
  rmSync(outDir, { recursive: true, force: true });
}
