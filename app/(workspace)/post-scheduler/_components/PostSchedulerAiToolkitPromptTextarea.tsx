"use client";

import { useState, type ReactElement, type ReactNode } from "react";

import { useTranslations } from "@/lib/i18n/WorkspaceLocaleProvider";

import { PostSchedulerAiToolkitPromptExpandModal } from "./PostSchedulerAiToolkitPromptExpandModal";
import {
  AI_TOOLKIT_PROMPT_TEXTAREA_CLASS,
  AI_TOOLKIT_PROMPT_TEXTAREA_ROWS,
} from "./postSchedulerAiToolkitPromptFieldStyles";

export function PostSchedulerAiToolkitPromptTextarea({
  label,
  placeholder,
  value,
  onChange,
  disabled,
  maxLength,
  belowField,
}: {
  readonly label: string;
  readonly placeholder: string;
  readonly value: string;
  readonly onChange: (v: string) => void;
  readonly disabled?: boolean;
  readonly maxLength?: number;
  readonly belowField?: ReactNode;
}): ReactElement {
  const { t } = useTranslations();
  const [expandOpen, setExpandOpen] = useState(false);
  const isOverLimit =
    maxLength !== undefined && value.length > maxLength;

  return (
    <>
      <label className="block">
        <div className="mb-1 flex items-center justify-between gap-2">
          <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">
            {label}
          </span>
          <button
            type="button"
            disabled={disabled}
            onClick={() => setExpandOpen(true)}
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-on-surface-variant transition-colors hover:bg-surface-container-high hover:text-on-surface disabled:cursor-not-allowed disabled:opacity-40"
            aria-label={t("postScheduler.aiToolkit.expandPromptAria")}
            title={t("postScheduler.aiToolkit.expandPromptAria")}
          >
            <span className="material-symbols-outlined text-[18px] leading-none" aria-hidden>
              open_in_new
            </span>
          </button>
        </div>
        <textarea
          value={value}
          onChange={(e) => {
            onChange(e.target.value);
          }}
          rows={AI_TOOLKIT_PROMPT_TEXTAREA_ROWS}
          disabled={disabled}
          placeholder={placeholder}
          className={`${AI_TOOLKIT_PROMPT_TEXTAREA_CLASS}${
            isOverLimit ? " border-red-500 bg-red-500/10 focus:ring-red-500/40" : ""
          }`}
        />
        {maxLength !== undefined ? (
          <div className="mt-1 flex justify-between">
            {isOverLimit ? (
              <p className="text-[10px] text-red-400">
                {t("postScheduler.aiToolkit.tooLong", { max: maxLength })}
              </p>
            ) : (
              <span />
            )}
            <p
              className={`text-[10px] ${isOverLimit ? "text-red-400" : "text-neutral-500"}`}
            >
              {value.length}/{maxLength}
            </p>
          </div>
        ) : null}
        {belowField}
      </label>

      <PostSchedulerAiToolkitPromptExpandModal
        open={expandOpen}
        title={label}
        placeholder={placeholder}
        value={value}
        disabled={disabled}
        maxLength={maxLength}
        onChange={onChange}
        onClose={() => setExpandOpen(false)}
      />
    </>
  );
}
