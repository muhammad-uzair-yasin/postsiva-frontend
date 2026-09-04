"use client";

import Link from "next/link";

import { useTranslations } from "@/lib/i18n/WorkspaceLocaleProvider";

interface PersonaEditorContentProps {
  backHref: string;
  backLabel: string;
}

export function PersonaEditorContent({
  backHref,
  backLabel,
}: PersonaEditorContentProps): React.ReactElement {
  const { t } = useTranslations();

  const sliders = [
    { labelKey: "personas.sliderFormality", v: 72 },
    { labelKey: "personas.sliderCreativity", v: 55 },
    { labelKey: "personas.sliderBrevity", v: 40 },
  ] as const;

  return (
    <>
      <div className="mb-8 flex flex-wrap items-center gap-4">
        <Link
          href={backHref}
          className="text-sm font-bold text-on-surface-variant hover:text-secondary"
        >
          ← {backLabel}
        </Link>
        <span className="text-on-surface-variant">/</span>
        <span className="text-sm font-bold text-on-surface">
          {t("personas.editorBreadcrumb")}
        </span>
      </div>
      <div className="grid grid-cols-1 gap-10 lg:grid-cols-2">
        <div className="space-y-8">
          <div>
            <h2 className="text-3xl font-extrabold tracking-tight text-on-surface">
              {t("personas.editorTitle")}
            </h2>
            <p className="mt-2 text-sm text-on-surface-variant">
              {t("personas.editorSubtitle")}
            </p>
          </div>
          <div className="space-y-6 rounded-2xl border border-outline-variant/10 bg-surface-container p-6">
            {sliders.map((s) => {
              const label = t(s.labelKey);
              return (
                <div key={s.labelKey} className="space-y-2">
                  <div className="flex justify-between text-xs font-bold uppercase tracking-wider text-on-surface-variant">
                    <span>{label}</span>
                    <span>{s.v}%</span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    defaultValue={s.v}
                    className="h-1 w-full accent-secondary"
                    aria-label={label}
                  />
                </div>
              );
            })}
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">
              {t("personas.systemInstructions")}
            </label>
            <textarea
              rows={5}
              defaultValue={t("personas.systemInstructionsDefault")}
              className="w-full rounded-xl border border-outline-variant/15 bg-surface-container-lowest px-4 py-3 text-sm text-on-surface focus:border-secondary focus:ring-2 focus:ring-secondary/20"
            />
          </div>
          <button
            type="button"
            className="w-full rounded-xl bg-secondary-container py-3 text-sm font-bold text-on-secondary-container shadow-lg shadow-secondary-container/15 transition-opacity hover:opacity-90 lg:w-auto lg:px-12"
          >
            {t("personas.savePersona")}
          </button>
        </div>
        <div className="rounded-2xl border border-outline-variant/10 bg-surface-container-low p-6">
          <h3 className="text-sm font-bold uppercase tracking-widest text-on-surface-variant">
            {t("personas.liveSample")}
          </h3>
          <div className="mt-4 rounded-xl border border-outline-variant/10 bg-surface-container p-4 text-sm leading-relaxed text-on-surface">
            {t("personas.liveSampleText")}
          </div>
          <p className="mt-4 text-xs text-on-surface-variant">
            {t("personas.liveSampleHint")}
          </p>
        </div>
      </div>
    </>
  );
}
