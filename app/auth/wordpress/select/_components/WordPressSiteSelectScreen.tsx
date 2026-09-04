"use client";

import { useWordPressSiteSelect } from "../_hooks/useWordPressSiteSelect";
import { WordPressSiteRow } from "./WordPressSiteRow";

/**
 * Site picker for the WordPress.com OAuth popup. Runs OUTSIDE the workspace shell
 * (no AuthSessionGate/onboarding) so an unverified account is never bounced to
 * /verify-otp mid-connect.
 */
export function WordPressSiteSelectScreen(): React.ReactElement {
  const {
    loading,
    error,
    accountLogin,
    sites,
    selected,
    submitting,
    connectedCount,
    toggle,
    confirm,
    selectableCount,
  } = useWordPressSiteSelect();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-surface text-on-surface">
        <p className="text-on-surface-variant">Loading your sites…</p>
      </div>
    );
  }

  if (connectedCount !== null) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-surface px-6 text-center text-on-surface">
        <p className="text-lg font-semibold">
          {connectedCount === 1 ? "1 site connected" : `${connectedCount} sites connected`}
        </p>
        <p className="text-sm text-on-surface-variant">You can close this window.</p>
      </div>
    );
  }

  if (error && sites.length === 0) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-surface px-6 text-center text-on-surface">
        <p className="text-lg font-semibold text-red-200" role="alert">
          Couldn&apos;t connect WordPress
        </p>
        <p className="max-w-sm text-sm text-on-surface-variant">{error}</p>
        <button
          type="button"
          onClick={() => window.close()}
          className="mt-2 rounded-xl bg-primary-container px-6 py-3 font-bold text-on-primary-container"
        >
          Close
        </button>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen justify-center bg-surface px-6 py-10 text-on-surface">
      <div className="w-full max-w-lg">
        <h1 className="text-xl font-semibold">Choose sites to connect</h1>
        <p className="mt-1 text-sm text-on-surface-variant">
          {accountLogin
            ? `Signed in to WordPress.com as ${accountLogin}.`
            : "Signed in to WordPress.com."}{" "}
          Each site you pick becomes its own channel.
        </p>

        {error ? (
          <p className="mt-4 rounded-lg bg-red-500/10 px-4 py-3 text-sm text-red-200" role="alert">
            {error}
          </p>
        ) : null}

        <ul className="mt-6 flex flex-col gap-2">
          {sites.map((site) => (
            <WordPressSiteRow
              key={site.remoteSiteId}
              site={site}
              checked={selected.has(site.remoteSiteId)}
              onToggle={toggle}
            />
          ))}
        </ul>

        {selectableCount === 0 ? (
          <p className="mt-6 text-sm text-on-surface-variant">
            None of the sites on this account allow publishing.
          </p>
        ) : null}

        <div className="mt-8 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={() => window.close()}
            className="rounded-xl px-5 py-3 text-sm font-semibold text-on-surface-variant"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => void confirm()}
            disabled={submitting || selected.size === 0}
            className="rounded-xl bg-primary-container px-6 py-3 text-sm font-bold text-on-primary-container disabled:opacity-50"
          >
            {submitting
              ? "Connecting…"
              : selected.size === 1
                ? "Connect 1 site"
                : `Connect ${selected.size} sites`}
          </button>
        </div>
      </div>
    </div>
  );
}
