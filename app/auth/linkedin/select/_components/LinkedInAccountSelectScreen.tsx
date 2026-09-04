"use client";

import { LinkedInAccountRow } from "./LinkedInAccountRow";
import { useLinkedInAccountSelect } from "../_hooks/useLinkedInAccountSelect";

/**
 * Post-OAuth LinkedIn Select accounts UI (popup). Gate-free — no AuthSessionGate.
 */
export function LinkedInAccountSelectScreen(): React.ReactElement {
  const {
    loading,
    error,
    destinations,
    selected,
    submitting,
    connectedCount,
    toggle,
    selectAll,
    clearNewSelections,
    confirm,
    newSelectableCount,
    selectedNewCount,
  } = useLinkedInAccountSelect();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-100 text-slate-700">
        <p>Loading LinkedIn accounts…</p>
      </div>
    );
  }

  if (connectedCount !== null) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-slate-100 px-6 text-center text-slate-800">
        <p className="text-lg font-semibold">
          {connectedCount === 1
            ? "1 account connected"
            : `${connectedCount} accounts connected`}
        </p>
        <p className="text-sm text-slate-500">You can close this window.</p>
      </div>
    );
  }

  if (error && destinations.length === 0) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-slate-100 px-6 text-center text-slate-800">
        <p className="text-lg font-semibold text-red-600" role="alert">
          Couldn&apos;t connect LinkedIn
        </p>
        <p className="max-w-sm text-sm text-slate-500">{error}</p>
        <button
          type="button"
          onClick={() => window.close()}
          className="mt-2 rounded-lg bg-[#0A66C2] px-6 py-3 font-semibold text-white"
        >
          Close
        </button>
      </div>
    );
  }

  const allSelectableKeys = destinations.map((d) => d.destinationKey);
  const allSelected =
    allSelectableKeys.length > 0 &&
    allSelectableKeys.every((k) => selected.has(k));

  return (
    <div className="flex min-h-screen items-start justify-center bg-slate-100 px-4 py-10 text-slate-900">
      <div className="w-full max-w-lg overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-3">
          <span className="text-xs font-medium text-slate-400">Switch Account</span>
          <div className="flex items-center gap-2 text-[#0A66C2]" aria-hidden>
            <span className="text-sm">▣</span>
            <span className="text-sm">⇅</span>
            <span className="text-lg font-bold">in</span>
          </div>
          <button
            type="button"
            onClick={() => window.close()}
            className="text-slate-400 hover:text-slate-700"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        <div className="px-5 pb-5 pt-6">
          <h1 className="text-center text-2xl font-bold tracking-tight">Select accounts</h1>

          <div className="mt-5 flex items-center justify-between text-sm">
            <span className="text-slate-600">{selectedNewCount} selected</span>
            <label className="flex cursor-pointer items-center gap-2 text-slate-700">
              <span>Select All</span>
              <input
                type="checkbox"
                checked={allSelected}
                onChange={() => {
                  if (allSelected) clearNewSelections();
                  else selectAll();
                }}
                className="h-4 w-4 accent-[#0A66C2]"
              />
            </label>
          </div>

          <div className="mt-4 flex gap-2 rounded-lg border border-sky-100 bg-sky-50 px-3 py-3 text-sm text-sky-900">
            <span className="mt-0.5 shrink-0 font-bold text-sky-600" aria-hidden>
              i
            </span>
            <p>
              Make sure you&apos;re signing in with the LinkedIn account that has Super Admin
              permissions for the Pages you&apos;re looking to connect.
            </p>
          </div>

          {error ? (
            <p className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
              {error}
            </p>
          ) : null}

          <ul className="mt-5 flex max-h-[50vh] flex-col gap-2 overflow-y-auto">
            {destinations.map((destination) => (
              <LinkedInAccountRow
                key={destination.destinationKey}
                destination={destination}
                checked={selected.has(destination.destinationKey)}
                onToggle={toggle}
              />
            ))}
          </ul>

          {newSelectableCount === 0 ? (
            <p className="mt-4 text-sm text-slate-500">
              All available LinkedIn accounts on this login are already connected.
            </p>
          ) : null}

          <div className="mt-6 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => window.close()}
              className="text-sm font-medium text-slate-500 hover:text-slate-800"
            >
              Need Help
            </button>
            <button
              type="button"
              onClick={() => void confirm()}
              disabled={submitting || selectedNewCount === 0}
              className="rounded-lg bg-[#0A66C2] px-6 py-3 text-sm font-bold text-white disabled:bg-slate-300 disabled:text-slate-500"
            >
              {submitting ? "Connecting…" : "Finish Connection"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
