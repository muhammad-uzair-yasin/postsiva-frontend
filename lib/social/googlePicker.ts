import type { PickerConfig } from "./cloudStorageApi";

/**
 * Lazily loads Google's hosted Picker + Identity Services and opens a Drive
 * picker. Only browser-safe values (api_key, app_id, client_id) are used here;
 * the OAuth access token is minted client-side via GIS with the read-only Drive
 * scope (so the Picker can render thumbnails) and never leaves the browser.
 */

export interface GoogleDrivePickedFile {
  id: string;
  name: string;
  mimeType: string;
}

const GAPI_SRC = "https://apis.google.com/js/api.js";
const GIS_SRC = "https://accounts.google.com/gsi/client";
// Read-only access to all Drive files so the Picker can show thumbnails and the
// import can download any selected file. NOTE: `drive.readonly` is a Google
// "restricted" scope — needs CASA verification for external users; until then
// only OAuth "Test users" can use it.
const DRIVE_SCOPE = "https://www.googleapis.com/auth/drive.readonly";

interface GapiPickerNamespace {
  PickerBuilder: new () => GooglePickerBuilder;
  DocsView: new (viewId?: unknown) => GoogleDocsView;
  ViewId: { DOCS: unknown; DOCS_IMAGES_AND_VIDEOS: unknown };
  Action: { PICKED: string; CANCEL: string };
  Response: { ACTION: string; DOCUMENTS: string };
  Document: { ID: string; NAME: string; MIME_TYPE: string };
  Feature: { MULTISELECT_ENABLED: unknown; MINE_ONLY: unknown };
}

interface GooglePickerBuilder {
  addView(view: GoogleDocsView): GooglePickerBuilder;
  enableFeature(feature: unknown): GooglePickerBuilder;
  setOAuthToken(token: string): GooglePickerBuilder;
  setDeveloperKey(key: string): GooglePickerBuilder;
  setAppId(appId: string): GooglePickerBuilder;
  setCallback(cb: (data: Record<string, unknown>) => void): GooglePickerBuilder;
  setTitle(title: string): GooglePickerBuilder;
  build(): { setVisible(visible: boolean): void };
}

interface GoogleDocsView {
  setMimeTypes(mimeTypes: string): GoogleDocsView;
  setSelectFolderEnabled(enabled: boolean): GoogleDocsView;
  setIncludeFolders(enabled: boolean): GoogleDocsView;
}

interface GapiGlobal {
  load(name: string, cb: () => void): void;
  picker?: GapiPickerNamespace;
}

interface GisTokenClient {
  requestAccessToken(overrides?: { prompt?: string }): void;
}

interface GisGlobal {
  accounts: {
    oauth2: {
      initTokenClient(config: {
        client_id: string;
        scope: string;
        callback: (resp: { access_token?: string; error?: string }) => void;
        error_callback?: (err: { type?: string }) => void;
      }): GisTokenClient;
    };
  };
}

declare global {
  interface Window {
    gapi?: GapiGlobal;
    google?: { picker?: GapiPickerNamespace } & GisGlobal;
  }
}

/** A user closing the token consent popup or the picker resolves as cancelled, not an error. */
export class GooglePickerCancelledError extends Error {
  constructor() {
    super("google_picker_cancelled");
    this.name = "GooglePickerCancelledError";
  }
}

function loadScript(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    if (typeof document === "undefined") {
      reject(new Error("google_picker_no_dom"));
      return;
    }
    const existing = document.querySelector<HTMLScriptElement>(
      `script[src="${src}"]`,
    );
    if (existing) {
      if (existing.dataset.loaded === "true") {
        resolve();
        return;
      }
      existing.addEventListener("load", () => {
        resolve();
      });
      existing.addEventListener("error", () => {
        reject(new Error(`google_script_failed:${src}`));
      });
      return;
    }
    const script = document.createElement("script");
    script.src = src;
    script.async = true;
    script.defer = true;
    script.addEventListener("load", () => {
      script.dataset.loaded = "true";
      resolve();
    });
    script.addEventListener("error", () => {
      reject(new Error(`google_script_failed:${src}`));
    });
    document.head.appendChild(script);
  });
}

function loadPickerApi(): Promise<GapiPickerNamespace> {
  return new Promise((resolve, reject) => {
    const gapi = window.gapi;
    if (!gapi) {
      reject(new Error("google_gapi_unavailable"));
      return;
    }
    gapi.load("picker", () => {
      const picker = window.google?.picker ?? window.gapi?.picker;
      if (!picker) {
        reject(new Error("google_picker_unavailable"));
        return;
      }
      resolve(picker);
    });
  });
}

/** Mint a short-lived Drive OAuth token via GIS. Rejects on user cancel. */
function requestDriveAccessToken(clientId: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const gis = window.google;
    if (!gis?.accounts?.oauth2) {
      reject(new Error("google_gis_unavailable"));
      return;
    }
    let settled = false;
    const client = gis.accounts.oauth2.initTokenClient({
      client_id: clientId,
      scope: DRIVE_SCOPE,
      callback: (resp) => {
        if (settled) {
          return;
        }
        settled = true;
        if (resp.access_token) {
          resolve(resp.access_token);
        } else {
          reject(new Error(resp.error ?? "google_token_failed"));
        }
      },
      error_callback: (err) => {
        if (settled) {
          return;
        }
        settled = true;
        if (err.type === "popup_closed" || err.type === "popup_failed_to_open") {
          reject(new GooglePickerCancelledError());
        } else {
          reject(new Error(err.type ?? "google_token_failed"));
        }
      },
    });
    client.requestAccessToken({ prompt: "" });
  });
}

/**
 * Opens the Google Drive picker filtered to the given mime types (images/video),
 * with multi-select enabled. Resolves with the chosen files, or rejects with a
 * `GooglePickerCancelledError` when the user cancels.
 */
export async function openGoogleDrivePicker(
  config: PickerConfig,
  opts?: { title?: string },
): Promise<GoogleDrivePickedFile[]> {
  if (!config.api_key || !config.app_id || !config.client_id) {
    throw new Error("google_picker_config_incomplete");
  }
  await Promise.all([loadScript(GAPI_SRC), loadScript(GIS_SRC)]);
  const [picker, accessToken] = await Promise.all([
    loadPickerApi(),
    requestDriveAccessToken(config.client_id),
  ]);

  const mimeFilters = config.mime_filters.filter((m) => m.trim().length > 0);

  return new Promise((resolve, reject) => {
    let done = false;
    const view = new picker.DocsView(picker.ViewId.DOCS)
      .setIncludeFolders(false)
      .setSelectFolderEnabled(false);
    if (mimeFilters.length > 0) {
      view.setMimeTypes(mimeFilters.join(","));
    }
    const builder = new picker.PickerBuilder()
      .addView(view)
      .enableFeature(picker.Feature.MULTISELECT_ENABLED)
      .setOAuthToken(accessToken)
      .setDeveloperKey(config.api_key as string)
      .setAppId(config.app_id as string)
      .setCallback((data) => {
        const action = data[picker.Response.ACTION];
        if (action === picker.Action.CANCEL) {
          if (!done) {
            done = true;
            reject(new GooglePickerCancelledError());
          }
          return;
        }
        if (action !== picker.Action.PICKED) {
          return;
        }
        const docs = (data[picker.Response.DOCUMENTS] as
          | Record<string, unknown>[]
          | undefined) ?? [];
        const files: GoogleDrivePickedFile[] = docs.map((doc) => ({
          id: String(doc[picker.Document.ID] ?? ""),
          name: String(doc[picker.Document.NAME] ?? ""),
          mimeType: String(doc[picker.Document.MIME_TYPE] ?? ""),
        }));
        if (!done) {
          done = true;
          resolve(files.filter((f) => f.id));
        }
      });
    if (opts?.title) {
      builder.setTitle(opts.title);
    }
    builder.build().setVisible(true);
  });
}
