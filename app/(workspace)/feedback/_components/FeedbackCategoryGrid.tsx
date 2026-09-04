"use client";

import { useTranslations } from "@/lib/i18n/WorkspaceLocaleProvider";

import { FEEDBACK_CATEGORY_CARDS } from "../_data/feedbackCategoryCards";
import type { FeedbackCategoryId } from "../_types/feedbackForm";

interface FeedbackCategoryGridProps {
  value: FeedbackCategoryId;
  onChange: (id: FeedbackCategoryId) => void;
}

const CATEGORY_I18N: Record<
  FeedbackCategoryId,
  { title: string; description: string }
> = {
  bug: {
    title: "feedback.categoryBugTitle",
    description: "feedback.categoryBugDescription",
  },
  feature: {
    title: "feedback.categoryFeatureTitle",
    description: "feedback.categoryFeatureDescription",
  },
  improvement: {
    title: "feedback.categoryImprovementTitle",
    description: "feedback.categoryImprovementDescription",
  },
};

export function FeedbackCategoryGrid({
  value,
  onChange,
}: FeedbackCategoryGridProps): React.ReactElement {
  const { t } = useTranslations();

  return (
    <section>
      <h2 className="mb-6 text-sm font-bold uppercase tracking-[0.2em] text-secondary">
        {t("feedback.selectCategory")}
      </h2>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {FEEDBACK_CATEGORY_CARDS.map((c) => {
          const selected = value === c.id;
          const copy = CATEGORY_I18N[c.id];
          return (
            <button
              key={c.id}
              type="button"
              onClick={() => {
                onChange(c.id);
              }}
              className={`rounded-xl p-6 text-left transition-all active:scale-[0.98] ${
                selected
                  ? c.selectedRing
                    ? "relative overflow-hidden border-2 border-primary-container bg-surface-container-high shadow-[0_0_20px_rgba(107,73,216,0.1)]"
                    : "border-2 border-outline-variant/25 bg-surface-container-high"
                  : "border border-outline-variant/10 bg-surface-container hover:bg-surface-container-high"
              }`}
            >
              {selected && c.selectedRing ? (
                <div className="absolute -right-12 -top-12 mr-12 mt-12 h-24 w-24 rounded-full bg-primary-container/10 blur-2xl" />
              ) : null}
              <div
                className={`relative mb-4 flex h-12 w-12 items-center justify-center rounded-lg transition-transform hover:scale-110 ${c.iconBox}`}
              >
                <span
                  className="material-symbols-outlined"
                  style={
                    c.iconFilled
                      ? { fontVariationSettings: "'FILL' 1" }
                      : undefined
                  }
                >
                  {c.icon}
                </span>
              </div>
              <h3 className="relative mb-2 font-bold text-on-surface">
                {t(copy.title)}
              </h3>
              <p className="relative text-sm leading-relaxed text-on-surface-variant">
                {t(copy.description)}
              </p>
            </button>
          );
        })}
      </div>
    </section>
  );
}
