/** Download a remote asset to the user's device. Falls back to opening the URL
 *  in a new tab when the fetch is blocked by CORS. */
export async function downloadToDevice(url: string, filename?: string): Promise<void> {
  const name = filename?.trim() || urlFilename(url);
  try {
    const res = await fetch(url, { mode: "cors" });
    if (!res.ok) {
      throw new Error(`download failed: ${res.status}`);
    }
    const blob = await res.blob();
    const objectUrl = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = objectUrl;
    a.download = name;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.setTimeout(() => URL.revokeObjectURL(objectUrl), 1000);
  } catch {
    // CORS / network — open in a new tab so the user can still save it.
    window.open(url, "_blank", "noopener,noreferrer");
  }
}

function urlFilename(url: string): string {
  try {
    const path = new URL(url).pathname;
    const last = path.split("/").filter(Boolean).pop();
    return last || "download";
  } catch {
    return "download";
  }
}
