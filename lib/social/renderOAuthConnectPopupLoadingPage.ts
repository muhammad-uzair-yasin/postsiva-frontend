/**
 * Fills a same-origin OAuth popup with a branded loading screen before `location.href`
 * is set to the provider authorize URL.
 */
export function renderOAuthConnectPopupLoadingPage(popup: Window): void {
  const doc = popup.document;
  doc.open();
  doc.write(OAUTH_CONNECT_POPUP_LOADING_HTML);
  doc.close();
}

const OAUTH_CONNECT_POPUP_LOADING_HTML = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1"/>
  <meta name="color-scheme" content="dark"/>
  <title>Connecting · Postsiva</title>
  <style>
    *, *::before, *::after { box-sizing: border-box; }
    body {
      margin: 0;
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 24px;
      font-family: system-ui, -apple-system, "Segoe UI", Roboto, Ubuntu, sans-serif;
      background: radial-gradient(ellipse 120% 80% at 50% 0%, #1e1a2e 0%, #0d0d12 55%, #08080c 100%);
      color: #ececf1;
      -webkit-font-smoothing: antialiased;
    }
    .shell {
      width: 100%;
      max-width: 340px;
      text-align: center;
    }
    .badge {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 56px;
      height: 56px;
      border-radius: 16px;
      background: linear-gradient(135deg, rgba(107, 73, 216, 0.35) 0%, rgba(107, 73, 216, 0.08) 100%);
      border: 1px solid rgba(167, 139, 250, 0.25);
      margin-bottom: 20px;
    }
    .badge svg { width: 28px; height: 28px; color: #c4b5fd; }
    .brand {
      font-size: 13px;
      font-weight: 700;
      letter-spacing: 0.12em;
      text-transform: uppercase;
      color: #a78bfa;
      margin-bottom: 8px;
    }
    h1 {
      font-size: 1.25rem;
      font-weight: 700;
      line-height: 1.3;
      margin: 0 0 12px;
      color: #f4f4f8;
    }
    p {
      margin: 0;
      font-size: 0.875rem;
      line-height: 1.55;
      color: #9b9bab;
    }
    .spinner-wrap {
      display: flex;
      justify-content: center;
      margin-top: 28px;
    }
    .spinner {
      width: 36px;
      height: 36px;
      border-radius: 50%;
      border: 3px solid rgba(167, 139, 250, 0.2);
      border-top-color: #a78bfa;
      animation: oauth-spin 0.85s linear infinite;
    }
    @keyframes oauth-spin {
      to { transform: rotate(360deg); }
    }
  </style>
</head>
<body>
  <div class="shell">
    <div class="badge" aria-hidden="true">
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">
        <path d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101"/>
        <path d="M10.172 13.828a4 4 0 015.656 0l4 4a4 4 0 11-5.656 5.656l-1.102-1.101"/>
      </svg>
    </div>
    <div class="brand">Postsiva</div>
    <h1>Preparing secure connection</h1>
    <p>Hang tight — we’re opening your provider’s sign-in page in this window. You can close it when you’re finished.</p>
    <div class="spinner-wrap" aria-live="polite" aria-busy="true">
      <div class="spinner" role="status" aria-label="Loading"></div>
    </div>
  </div>
</body>
</html>`;
