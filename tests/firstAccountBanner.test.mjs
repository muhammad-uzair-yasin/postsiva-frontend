import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const outDir = mkdtempSync(join(process.cwd(), "tests/.tmp-first-account-banner-"));
const require = createRequire(import.meta.url);

try {
  const ts = require("typescript");
  const helperPath = join(process.cwd(), "lib/workspace/firstAccountBanner.ts");
  const compiled = ts.transpileModule(readFileSync(helperPath, "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
  });
  const outputPath = join(outDir, "firstAccountBanner.js");
  writeFileSync(outputPath, compiled.outputText);
  const { shouldShowFirstAccountBanner } = require(outputPath);
  const emptyKnown = {
    isWorkspaceSelection: false,
    isLoading: false,
    profilesError: null,
    oauthStatusKnown: true,
    hasAnySocialConnection: false,
  };

  assert.equal(shouldShowFirstAccountBanner(emptyKnown), true);
  assert.equal(
    shouldShowFirstAccountBanner({ ...emptyKnown, pathname: "/dashboard" }),
    false,
  );
  assert.equal(shouldShowFirstAccountBanner({ ...emptyKnown, isLoading: true }), false);
  assert.equal(shouldShowFirstAccountBanner({ ...emptyKnown, profilesError: "failed" }), false);
  assert.equal(shouldShowFirstAccountBanner({ ...emptyKnown, oauthStatusKnown: false }), false);
  assert.equal(shouldShowFirstAccountBanner({ ...emptyKnown, hasAnySocialConnection: true }), false);
  assert.equal(shouldShowFirstAccountBanner({ ...emptyKnown, isWorkspaceSelection: true }), false);

  const contentPath = join(
    process.cwd(),
    "app/(workspace)/_components/WorkspaceNoticeBanner.tsx",
  );
  const contentCompiled = ts.transpileModule(readFileSync(contentPath, "utf8"), {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2020,
      jsx: ts.JsxEmit.ReactJSX,
    },
  });
  const contentOutput = join(outDir, "WorkspaceNoticeBanner.js");
  writeFileSync(contentOutput, contentCompiled.outputText);
  const { WorkspaceNoticeBanner } = require(contentOutput);
  let connectCalls = 0;
  const element = WorkspaceNoticeBanner({
    tone: "primary",
    icon: "add_link",
    body: "Connect your first social account",
    cta: "Connect account",
    onAction: () => {
      connectCalls += 1;
    },
  });
  const button = element.props.children[1];
  assert.equal(button.props.children, "Connect account");
  button.props.onClick();
  assert.equal(connectCalls, 1);

  const reactDomServer = require("react-dom/server");
  const html = reactDomServer.renderToStaticMarkup(element);
  assert.match(html, /Connect your first social account/);
  assert.match(html, /Connect account/);

  const warningElement = WorkspaceNoticeBanner({
    tone: "warning",
    icon: "mark_email_unread",
    body: "Kindly verify your email",
    cta: "Verify email",
    onAction: () => undefined,
  });
  const warningHtml = reactDomServer.renderToStaticMarkup(warningElement);
  assert.match(warningHtml, /Kindly verify your email/);
  assert.match(warningHtml, /Verify email/);
  assert.match(warningHtml, /amber/);

  for (const locale of ["en", "bs"]) {
    const catalogPath = join(process.cwd(), `lib/i18n/messages/${locale}/dashboard.ts`);
    const catalogCompiled = ts.transpileModule(readFileSync(catalogPath, "utf8"), {
      compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
    });
    const catalogOutput = join(outDir, `${locale}-dashboard.js`);
    writeFileSync(catalogOutput, catalogCompiled.outputText);
    const { dashboard } = require(catalogOutput);
    assert.ok(dashboard.firstAccountBannerBody.length > 20);
    assert.ok(dashboard.firstAccountBannerCta.length > 5);
    assert.ok(dashboard.firstAccountBannerEyebrow.length > 5);
    assert.ok(dashboard.connectFirstTitle.length > 5);
    assert.ok(dashboard.connectFirstBody.length > 20);
  }
  console.log("first-account banner tests passed");
} finally {
  rmSync(outDir, { recursive: true, force: true });
}
