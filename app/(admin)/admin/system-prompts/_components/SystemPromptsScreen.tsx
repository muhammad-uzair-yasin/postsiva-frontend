"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { FileText, GitBranch, Loader2, RefreshCw, XCircle } from "lucide-react";

import { useSystemPrompts } from "../_hooks/useSystemPrompts";
import {
  filterPrompts,
  filtersForPromptKey,
  type PlatformId,
  type PromptRole,
  type PromptScope,
} from "../_data/promptFilters";
import { PromptEditorPanel } from "./PromptEditorPanel";
import { PromptList } from "./PromptList";
import { PromptListFilters } from "./PromptListFilters";

export function SystemPromptsScreen() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const keyFromUrl = searchParams.get("key");

  const {
    loading,
    loadError,
    prompts,
    selectedKey,
    detail,
    versions,
    draft,
    setDraft,
    note,
    setNote,
    detailLoading,
    busy,
    status,
    statusError,
    reloadList,
    selectPrompt,
    save,
    activate,
    resetToDefault,
  } = useSystemPrompts();

  const [scope, setScope] = useState<PromptScope>("unified");
  const [platform, setPlatform] = useState<PlatformId | "all">("all");
  const [role, setRole] = useState<PromptRole>("all");
  const [query, setQuery] = useState("");

  useEffect(() => {
    if (loading || !keyFromUrl) return;
    if (!prompts.some((p) => p.prompt_key === keyFromUrl)) return;
    const next = filtersForPromptKey(keyFromUrl);
    setScope(next.scope);
    setPlatform(next.platform);
    setRole(next.role);
    if (selectedKey !== keyFromUrl) {
      selectPrompt(keyFromUrl);
    }
  }, [loading, keyFromUrl, prompts, selectedKey, selectPrompt]);

  const filtered = useMemo(
    () => filterPrompts(prompts, { scope, platform, role, query }),
    [prompts, scope, platform, role, query],
  );

  const onSelect = (key: string) => {
    selectPrompt(key);
    router.replace(`/admin/system-prompts?key=${encodeURIComponent(key)}`, { scroll: false });
  };

  const onScopeChange = (next: PromptScope) => {
    setScope(next);
    if (next !== "platform") setPlatform("all");
  };

  return (
    <div className="w-full min-w-0 space-y-4">
      <div>
        <h1 className="flex items-center gap-2 text-xl font-bold text-on-surface">
          <FileText className="h-5 w-5 text-primary" />
          System Prompts
        </h1>
        <p className="mt-1 text-sm text-on-surface-variant">
          Filter by scope, then edit. Saves create a new version; reset restores the code default.
        </p>
        <Link
          href="/admin/agent-flows"
          className="mt-2 inline-flex items-center gap-1.5 text-xs font-bold text-primary hover:underline"
        >
          <GitBranch className="h-3.5 w-3.5" />
          Agent Flows
        </Link>
      </div>

      {loading ? (
        <div className="flex items-center gap-3 rounded-2xl border border-outline-variant/15 bg-surface-container-low px-4 py-6">
          <Loader2 className="h-4 w-4 animate-spin text-primary" />
          <span className="text-sm text-on-surface-variant">Loading prompts…</span>
        </div>
      ) : loadError ? (
        <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-error/25 bg-error/5 px-4 py-4">
          <XCircle className="h-4 w-4 shrink-0 text-error" />
          <span className="text-sm text-on-surface">{loadError}</span>
          <button
            type="button"
            onClick={() => void reloadList()}
            className="inline-flex items-center gap-1.5 rounded-xl border border-outline-variant/25 bg-surface-container px-3 py-1.5 text-sm font-bold"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Retry
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(280px,380px)_1fr]">
          <aside className="space-y-3 rounded-2xl border border-outline-variant/15 bg-surface-container-low p-3">
            <PromptListFilters
              scope={scope}
              platform={platform}
              role={role}
              query={query}
              resultCount={filtered.length}
              totalCount={prompts.length}
              onScopeChange={onScopeChange}
              onPlatformChange={setPlatform}
              onRoleChange={setRole}
              onQueryChange={setQuery}
            />
            <PromptList prompts={filtered} selectedKey={selectedKey} onSelect={onSelect} />
          </aside>

          <PromptEditorPanel
            detail={detail}
            versions={versions}
            draft={draft}
            note={note}
            detailLoading={detailLoading}
            busy={busy}
            status={status}
            statusError={statusError}
            onDraftChange={setDraft}
            onNoteChange={setNote}
            onSave={() => void save()}
            onReset={() => void resetToDefault()}
            onActivate={(id) => void activate(id)}
          />
        </div>
      )}
    </div>
  );
}
