"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

const PROVIDER_LABELS: Record<string, string> = {
  google_drive: "Google Drive",
  onedrive: "OneDrive",
  dropbox: "Dropbox",
};

/**
 * Lightweight landing page for the cloud-storage OAuth popup. It runs OUTSIDE the
 * workspace shell (no AuthSessionGate/onboarding), so a failed connect never
 * bounces the popup to /verify-otp. It reports status to the opener and closes.
 */
export function CloudConnectCompleteScreen(): React.ReactElement {
  const searchParams = useSearchParams();
  const cloud = searchParams.get("cloud");
  const provider = searchParams.get("provider") ?? "";
  const reason = searchParams.get("reason");
  const [closing, setClosing] = useState(false);

  const label = PROVIDER_LABELS[provider] ?? "Cloud storage";
  const success = cloud === "connected";

  useEffect(() => {
    // Notify the opener so it can refresh the connection list immediately.
    try {
      window.opener?.postMessage(
        { type: "postsiva-cloud-connect", cloud, provider, reason },
        window.location.origin,
      );
    } catch {
      /* cross-origin opener — ignore */
    }
    if (success) {
      setClosing(true);
      const id = window.setTimeout(() => window.close(), 900);
      return () => window.clearTimeout(id);
    }
    return undefined;
  }, [cloud, provider, reason, success]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-surface px-6 text-center text-on-surface">
      {success ? (
        <>
          <p className="text-lg font-semibold">{label} connected</p>
          <p className="text-sm text-on-surface-variant">
            {closing ? "You can close this window." : "Finishing up…"}
          </p>
        </>
      ) : (
        <>
          <p className="text-lg font-semibold text-red-200" role="alert">
            Couldn&apos;t connect {label}
          </p>
          <p className="max-w-sm text-sm text-on-surface-variant">
            {reason
              ? `Reason: ${reason.replace(/_/g, " ")}.`
              : "Something went wrong. Please try again."}
          </p>
          <button
            type="button"
            onClick={() => window.close()}
            className="mt-2 rounded-xl bg-primary-container px-6 py-3 font-bold text-on-primary-container"
          >
            Close
          </button>
        </>
      )}
    </div>
  );
}
