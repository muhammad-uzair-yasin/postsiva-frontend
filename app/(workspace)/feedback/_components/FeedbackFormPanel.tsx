"use client";

import { FormEvent } from "react";

import { useTranslations } from "@/lib/i18n/WorkspaceLocaleProvider";

import type { FeedbackCategoryId, FeedbackPriorityId } from "../_types/feedbackForm";

const PRIORITIES: FeedbackPriorityId[] = ["low", "medium", "high"];

const PRIORITY_I18N: Record<FeedbackPriorityId, string> = {
  low: "feedback.priorityLow",
  medium: "feedback.priorityMedium",
  high: "feedback.priorityHigh",
};

interface FeedbackFormPanelProps {
  category: FeedbackCategoryId;
  priority: FeedbackPriorityId;
  onPriorityChange: (p: FeedbackPriorityId) => void;
  subject: string;
  onSubjectChange: (v: string) => void;
  description: string;
  onDescriptionChange: (v: string) => void;
  status: "idle" | "sent";
  isSubmitting: boolean;
  submitError: string | null;
  onSubmit: (e: FormEvent<HTMLFormElement>) => void;
  onSubmitAnother: () => void;
}

export function FeedbackFormPanel({
  category,
  priority,
  onPriorityChange,
  subject,
  onSubjectChange,
  description,
  onDescriptionChange,
  status,
  isSubmitting,
  submitError,
  onSubmit,
  onSubmitAnother,
}: FeedbackFormPanelProps): React.ReactElement {
  const { t } = useTranslations();

  return (
    <section className="rounded-2xl border border-outline-variant/5 bg-surface-container-low p-8">
      {status === "sent" ? (
        <div className="rounded-xl border border-secondary/30 bg-surface-container-lowest/80 p-8 text-center">
          <span className="material-symbols-outlined text-4xl text-secondary">
            check_circle
          </span>
          <p className="mt-4 font-bold text-on-surface">{t("feedback.thanksTitle")}</p>
          <p className="mt-2 text-sm text-on-surface-variant">
            {t("feedback.thanksBody")}
          </p>
          <button
            type="button"
            onClick={onSubmitAnother}
            className="mt-6 rounded-xl bg-surface-container-high px-6 py-3 text-sm font-bold text-on-surface transition-colors hover:bg-surface-container-highest"
          >
            {t("feedback.submitAnother")}
          </button>
        </div>
      ) : (
        <form className="space-y-6" onSubmit={onSubmit}>
          <input type="hidden" name="category" value={category} />
          {submitError ? (
            <div
              className="rounded-xl border border-error/40 bg-error-container/20 px-4 py-3 text-sm font-semibold text-on-error-container"
              role="alert"
            >
              {submitError}
            </div>
          ) : null}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <label className="ml-1 text-xs font-bold uppercase tracking-widest text-on-surface-variant">
                {t("feedback.subject")}
              </label>
              <input
                value={subject}
                onChange={(ev) => {
                  onSubjectChange(ev.target.value);
                }}
                className="w-full rounded-xl border-none bg-surface-container-lowest px-4 py-3 text-on-surface placeholder:text-on-tertiary-fixed-variant focus:ring-2 focus:ring-secondary"
                placeholder={t("feedback.subjectPlaceholder")}
                type="text"
                name="subject"
                autoComplete="off"
              />
            </div>
            <div className="space-y-2">
              <label className="ml-1 text-xs font-bold uppercase tracking-widest text-on-surface-variant">
                {t("feedback.priority")}
              </label>
              <div className="flex gap-2">
                {PRIORITIES.map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => {
                      onPriorityChange(p);
                    }}
                    className={`flex-1 rounded-xl border px-2 py-3 text-xs font-bold transition-colors ${
                      priority === p
                        ? "border-transparent bg-primary-container text-on-primary-container shadow-lg shadow-primary-container/20"
                        : "border-outline-variant/10 bg-surface-container-lowest text-on-surface-variant hover:bg-surface-container-high"
                    }`}
                  >
                    {t(PRIORITY_I18N[p])}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <div className="space-y-2">
            <label className="ml-1 text-xs font-bold uppercase tracking-widest text-on-surface-variant">
              {t("feedback.description")}
            </label>
            <textarea
              value={description}
              onChange={(ev) => {
                onDescriptionChange(ev.target.value);
              }}
              className="w-full resize-none rounded-xl border-none bg-surface-container-lowest px-4 py-3 text-on-surface placeholder:text-on-tertiary-fixed-variant focus:ring-2 focus:ring-secondary"
              placeholder={t("feedback.descriptionPlaceholder")}
              rows={6}
              name="description"
            />
          </div>
          <div className="space-y-2">
            <label className="ml-1 text-xs font-bold uppercase tracking-widest text-on-surface-variant">
              {t("feedback.attachments")}
            </label>
            <label className="group flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-outline-variant/20 bg-surface-container-lowest/50 p-8 transition-colors hover:bg-surface-container-lowest">
              <input type="file" accept=".png,.jpg,.jpeg,.pdf" className="sr-only" />
              <span className="material-symbols-outlined mb-2 text-4xl text-on-tertiary-fixed-variant group-hover:text-primary">
                cloud_upload
              </span>
              <p className="text-sm text-on-surface-variant">
                <span className="font-bold text-primary">{t("feedback.uploadClick")}</span>{" "}
                {t("feedback.uploadDrag")}
              </p>
              <p className="mt-1 text-xs text-on-tertiary-fixed-variant">
                {t("feedback.uploadFormats")}
              </p>
            </label>
          </div>
          <div className="flex justify-end pt-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 rounded-xl bg-primary-container px-10 py-4 font-bold tracking-tight text-on-primary-container shadow-xl shadow-primary-container/20 transition-all hover:brightness-110 active:scale-95 disabled:opacity-60"
            >
              <span>
                {isSubmitting ? t("feedback.sending") : t("feedback.submitFeedback")}
              </span>
              <span
                className={`material-symbols-outlined text-sm ${isSubmitting ? "animate-pulse" : ""}`}
              >
                send
              </span>
            </button>
          </div>
        </form>
      )}
    </section>
  );
}
