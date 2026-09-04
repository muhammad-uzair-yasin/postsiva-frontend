"use client";

import type { InsightsSnapshotUserDetail, InsightsWorkspace } from "@/lib/admin/insightsSnapshotsApi";

interface InsightsSnapshotDetailPanelProps {
  detail: InsightsSnapshotUserDetail;
  saving: boolean;
  onChange: (detail: InsightsSnapshotUserDetail) => void;
  onSave: () => void;
}

function togglePlatform(ws: InsightsWorkspace, platformId: string, selected: boolean): InsightsWorkspace {
  return {
    ...ws,
    platforms: ws.platforms.map((p) =>
      p.id === platformId
        ? {
            ...p,
            selected,
            sub_accounts: p.sub_accounts.map((sa) => ({ ...sa, selected })),
          }
        : p,
    ),
  };
}

function toggleSubAccount(
  ws: InsightsWorkspace,
  platformId: string,
  accountId: string,
  selected: boolean,
): InsightsWorkspace {
  return {
    ...ws,
    platforms: ws.platforms.map((p) =>
      p.id === platformId
        ? {
            ...p,
            selected: selected || p.sub_accounts.some((sa) => sa.id !== accountId && sa.selected),
            sub_accounts: p.sub_accounts.map((sa) =>
              sa.id === accountId ? { ...sa, selected } : sa,
            ),
          }
        : p,
    ),
  };
}

export function InsightsSnapshotDetailPanel({
  detail,
  saving,
  onChange,
  onSave,
}: InsightsSnapshotDetailPanelProps) {
  const updateWorkspaces = (workspaces: InsightsWorkspace[]) => {
    onChange({ ...detail, workspaces });
  };

  return (
    <div className="rounded-2xl border border-outline-variant/20 bg-surface-container-low p-5 space-y-5">
      <div>
        <h2 className="text-lg font-bold text-on-surface">{detail.full_name}</h2>
        <p className="text-sm text-on-surface-variant">{detail.email}</p>
      </div>

      <label className="flex items-center gap-3 rounded-xl border border-outline-variant/20 bg-surface-container/50 p-4">
        <input
          type="checkbox"
          checked={detail.insights_enabled}
          onChange={(e) => onChange({ ...detail, insights_enabled: e.target.checked })}
          className="h-5 w-5 rounded"
        />
        <div>
          <p className="font-semibold text-on-surface">Enable daily insight snapshots</p>
          <p className="text-xs text-on-surface-variant">Worker runs for this user when enabled</p>
        </div>
      </label>

      {detail.insights_enabled ? (
        <>
          <fieldset className="space-y-2">
            <legend className="text-xs font-semibold uppercase text-on-surface-variant">Scope</legend>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="radio"
                name="scope_mode"
                checked={detail.scope_mode === "all"}
                onChange={() => onChange({ ...detail, scope_mode: "all" })}
              />
              All workspaces · all connected channels (default)
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="radio"
                name="scope_mode"
                checked={detail.scope_mode === "custom"}
                onChange={() => onChange({ ...detail, scope_mode: "custom" })}
              />
              Custom — pick workspaces, platforms, and sub-accounts
            </label>
          </fieldset>

          {detail.scope_mode === "custom" ? (
            <div className="space-y-4">
              {detail.workspaces.map((ws, wsIdx) => (
                <div key={ws.id} className="rounded-xl border border-outline-variant/15 p-4">
                  <p className="font-semibold text-on-surface">{ws.name}</p>
                  <p className="text-xs font-mono text-on-surface-variant">{ws.id}</p>
                  <div className="mt-3 space-y-3">
                    {ws.platforms.filter((p) => p.connected).map((platform) => (
                      <div key={platform.id} className="rounded-lg bg-surface-container/40 p-3">
                        <label className="flex items-center gap-2 text-sm font-medium">
                          <input
                            type="checkbox"
                            checked={platform.selected}
                            onChange={(e) => {
                              const next = [...detail.workspaces];
                              next[wsIdx] = togglePlatform(ws, platform.id, e.target.checked);
                              updateWorkspaces(next);
                            }}
                          />
                          {platform.label}
                        </label>
                        {platform.sub_accounts.length > 0 && platform.selected ? (
                          <div className="mt-2 ml-6 space-y-1">
                            {platform.sub_accounts.map((sa) => (
                              <label key={sa.id} className="flex items-center gap-2 text-xs">
                                <input
                                  type="checkbox"
                                  checked={sa.selected}
                                  onChange={(e) => {
                                    const next = [...detail.workspaces];
                                    next[wsIdx] = toggleSubAccount(
                                      ws,
                                      platform.id,
                                      sa.id,
                                      e.target.checked,
                                    );
                                    updateWorkspaces(next);
                                  }}
                                />
                                {sa.label}
                                <span className="text-on-surface-variant">({sa.account_type})</span>
                              </label>
                            ))}
                          </div>
                        ) : null}
                      </div>
                    ))}
                    {ws.platforms.filter((p) => p.connected).length === 0 ? (
                      <p className="text-xs text-on-surface-variant">No connected platforms</p>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-on-surface-variant rounded-xl bg-surface-container/40 p-3">
              Snapshot will run for every workspace this user belongs to, all connected platforms,
              and all LinkedIn orgs / Facebook pages.
            </p>
          )}
        </>
      ) : null}

      <button
        type="button"
        disabled={saving}
        onClick={onSave}
        className="rounded-xl bg-primary px-4 py-2.5 text-sm font-bold text-on-primary disabled:opacity-50"
      >
        {saving ? "Saving…" : "Save access settings"}
      </button>
    </div>
  );
}
