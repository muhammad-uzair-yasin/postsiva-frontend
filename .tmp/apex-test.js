"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// lib/seo/apexRedirect.ts
var apexRedirect_exports = {};
__export(apexRedirect_exports, {
  buildApexRedirectUrl: () => buildApexRedirectUrl,
  getApexRedirectUrl: () => getApexRedirectUrl
});
module.exports = __toCommonJS(apexRedirect_exports);

// lib/seo/siteOrigin.ts
var APEX_HOST = "postsiva.com";
var WWW_HOST = "www.postsiva.com";

// lib/seo/apexRedirect.ts
function normalizeHost(host) {
  if (!host) return null;
  return host.split(":")[0]?.toLowerCase() ?? null;
}
function buildApexRedirectUrl(host, pathname, search = "") {
  const normalized = normalizeHost(host);
  if (normalized !== APEX_HOST) {
    return null;
  }
  const path = pathname.startsWith("/") ? pathname : `/${pathname}`;
  return new URL(`https://${WWW_HOST}${path}${search}`);
}
function getApexRedirectUrl(request) {
  return buildApexRedirectUrl(
    request.headers.get("host"),
    request.nextUrl.pathname,
    request.nextUrl.search
  );
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  buildApexRedirectUrl,
  getApexRedirectUrl
});
