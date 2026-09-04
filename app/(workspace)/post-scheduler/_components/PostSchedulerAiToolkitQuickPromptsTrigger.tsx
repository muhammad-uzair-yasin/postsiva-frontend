"use client";

import { useState, type ReactElement } from "react";

import { useTranslations } from "@/lib/i18n/WorkspaceLocaleProvider";

import { usePostSchedulerAiToolkitQuickPrompts } from "../_context/PostSchedulerAiToolkitQuickPromptsContext";
import { PostSchedulerAiQuickPromptsModal } from "./PostSchedulerAiQuickPromptsModal";

export function PostSchedulerAiToolkitQuickPromptsTrigger({
  disabled,
  onApply,
  variant = "full",
}: {
  readonly disabled?: boolean;
  readonly onApply: (body: string) => void;
  readonly variant?: "full" | "compact";
}): ReactElement {
  const { t } = useTranslations();
  const { items, loading } = usePostSchedulerAiToolkitQuickPrompts();
  const [open, setOpen] = useState(false);

  const compact = variant === "compact";

  return (
    <>
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen(true)}
        className={
          compact
            ? "inline-flex shrink-0 items-center gap-1 rounded-lg border border-[#6B49D8]/35 bg-[#6B49D8]/10 px-2.5 py-1.5 font-body text-[11px] font-bold text-[#6B49D8] transition-opacity hover:bg-[#6B49D8]/15 disabled:cursor-not-allowed disabled:opacity-50"
            : "flex w-full items-center justify-center gap-2 rounded-lg border border-[#6B49D8]/35 bg-[#6B49D8]/10 py-2.5 font-body text-xs font-bold text-[#6B49D8] transition-opacity hover:bg-[#6B49D8]/15 disabled:cursor-not-allowed disabled:opacity-50"
        }
      >
        <span
          className={`material-symbols-outlined leading-none ${compact ? "text-sm" : "text-base"}`}
          aria-hidden
        >
          bolt
        </span>
        {t("postScheduler.aiToolkit.quickPromptsButton")}
      </button>
      <PostSchedulerAiQuickPromptsModal
        open={open}
        loading={loading}
        items={items}
        onClose={() => setOpen(false)}
        onUse={(p) => {
          onApply(p.body);
        }}
      />
    </>
  );
}
