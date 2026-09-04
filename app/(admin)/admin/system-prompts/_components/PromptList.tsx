"use client";

import type { SystemPromptListItem } from "@/lib/admin/systemPromptsApi";
import { classifyPromptKey } from "../_data/promptFilters";

type Props = {
  prompts: SystemPromptListItem[];
  selectedKey: string | null;
  onSelect: (key: string) => void;
};

export function PromptList({ prompts, selectedKey, onSelect }: Props) {
  if (prompts.length === 0) {
    return (
      <p className="px-2 py-6 text-center text-sm text-on-surface-variant">
        No prompts match these filters.
      </p>
    );
  }

  return (
    <ul className="max-h-[min(70vh,720px)] space-y-1 overflow-y-auto pr-1">
      {prompts.map((p) => {
        const active = p.prompt_key === selectedKey;
        const c = classifyPromptKey(p.prompt_key);
        return (
          <li key={p.prompt_key}>
            <button
              type="button"
              onClick={() => onSelect(p.prompt_key)}
              className={`w-full rounded-xl px-3 py-2.5 text-left transition ${
                active
                  ? "bg-primary/12 text-on-surface ring-1 ring-primary/25"
                  : "hover:bg-surface-container text-on-surface"
              }`}
            >
              <div className="text-sm font-bold">{p.title}</div>
              <div className="mt-0.5 font-mono text-[10px] text-primary/90">{p.prompt_key}</div>
              <div className="mt-1 flex flex-wrap gap-1">
                <span className="rounded-md bg-surface-container px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-on-surface-variant">
                  {c.scope}
                </span>
                {c.platform ? (
                  <span className="rounded-md bg-surface-container px-1.5 py-0.5 text-[10px] font-bold text-on-surface-variant">
                    {c.platform}
                  </span>
                ) : null}
                <span className="rounded-md bg-surface-container px-1.5 py-0.5 text-[10px] text-on-surface-variant">
                  {p.is_default ? "default" : `v${p.active_version}`}
                </span>
              </div>
            </button>
          </li>
        );
      })}
    </ul>
  );
}
