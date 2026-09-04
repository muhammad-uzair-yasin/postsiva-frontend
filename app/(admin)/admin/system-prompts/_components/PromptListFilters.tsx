"use client";

import {
  PLATFORM_OPTIONS,
  ROLE_OPTIONS,
  SCOPE_OPTIONS,
  type PlatformId,
  type PromptRole,
  type PromptScope,
} from "../_data/promptFilters";

type Props = {
  scope: PromptScope;
  platform: PlatformId | "all";
  role: PromptRole;
  query: string;
  resultCount: number;
  totalCount: number;
  onScopeChange: (scope: PromptScope) => void;
  onPlatformChange: (platform: PlatformId | "all") => void;
  onRoleChange: (role: PromptRole) => void;
  onQueryChange: (query: string) => void;
};

function Chip({
  active,
  label,
  onClick,
}: {
  active: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-lg px-2.5 py-1 text-xs font-bold transition ${
        active
          ? "bg-primary text-on-primary"
          : "bg-surface-container text-on-surface-variant hover:bg-surface-container-high"
      }`}
    >
      {label}
    </button>
  );
}

export function PromptListFilters({
  scope,
  platform,
  role,
  query,
  resultCount,
  totalCount,
  onScopeChange,
  onPlatformChange,
  onRoleChange,
  onQueryChange,
}: Props) {
  return (
    <div className="space-y-2.5 border-b border-outline-variant/15 pb-3">
      <input
        value={query}
        onChange={(e) => onQueryChange(e.target.value)}
        placeholder="Search title or key…"
        className="w-full rounded-xl border border-outline-variant/25 bg-surface-container px-3 py-2 text-sm text-on-surface placeholder:text-on-surface-variant"
      />

      <div className="flex flex-wrap gap-1.5">
        {SCOPE_OPTIONS.map((opt) => (
          <Chip
            key={opt.id}
            active={scope === opt.id}
            label={opt.label}
            onClick={() => onScopeChange(opt.id)}
          />
        ))}
      </div>

      {scope === "platform" ? (
        <div className="flex flex-wrap gap-1.5">
          <Chip
            active={platform === "all"}
            label="All platforms"
            onClick={() => onPlatformChange("all")}
          />
          {PLATFORM_OPTIONS.map((opt) => (
            <Chip
              key={opt.id}
              active={platform === opt.id}
              label={opt.label}
              onClick={() => onPlatformChange(opt.id)}
            />
          ))}
        </div>
      ) : null}

      <div className="flex flex-wrap gap-1.5">
        {ROLE_OPTIONS.map((opt) => (
          <Chip
            key={opt.id}
            active={role === opt.id}
            label={opt.label}
            onClick={() => onRoleChange(opt.id)}
          />
        ))}
      </div>

      <p className="text-[11px] text-on-surface-variant">
        Showing {resultCount} of {totalCount}
      </p>
    </div>
  );
}
