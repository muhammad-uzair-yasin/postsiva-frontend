"use client";

import Link from "next/link";

import { useTranslations } from "@/lib/i18n/WorkspaceLocaleProvider";

import { PERSONA_GALLERY_CARDS } from "../_data/personaGallerySeed";

interface PersonasGalleryContentProps {
  editorHref: string;
}

const PERSONA_CARD_I18N: Record<
  string,
  { name: string; role: string; blurb: string }
> = {
  p1: {
    name: "personas.cardP1Name",
    role: "personas.cardP1Role",
    blurb: "personas.cardP1Blurb",
  },
  p2: {
    name: "personas.cardP2Name",
    role: "personas.cardP2Role",
    blurb: "personas.cardP2Blurb",
  },
  p3: {
    name: "personas.cardP3Name",
    role: "personas.cardP3Role",
    blurb: "personas.cardP3Blurb",
  },
};

export function PersonasGalleryContent({
  editorHref,
}: PersonasGalleryContentProps): React.ReactElement {
  const { t } = useTranslations();

  return (
    <>
      <header className="mb-8 flex flex-col gap-4 md:mb-12 md:flex-row md:items-end md:justify-between">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight text-on-surface md:text-4xl">
            {t("personas.engineTitle")}{" "}
            <span className="text-secondary">{t("personas.engineTitleAccent")}</span>
          </h2>
          <p className="mt-2 max-w-xl text-on-surface-variant">
            {t("personas.engineSubtitle")}
          </p>
        </div>
        <Link
          href={editorHref}
          className="inline-flex items-center justify-center rounded-xl bg-primary-container px-6 py-3 text-sm font-bold text-on-primary-container shadow-lg shadow-primary-container/20 transition-opacity hover:opacity-90"
        >
          {t("personas.newPersona")}
        </Link>
      </header>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
        {PERSONA_GALLERY_CARDS.map((p) => {
          const keys = PERSONA_CARD_I18N[p.id];
          return (
            <article
              key={p.id}
              className="rounded-2xl border border-outline-variant/10 bg-surface-container bg-[radial-gradient(circle_at_top_right,rgba(107,73,216,0.15),transparent)] p-6 shadow-xl"
            >
              <div
                className={`mx-auto mb-4 h-16 w-16 rounded-2xl bg-gradient-to-br p-[2px] ${p.ringClass}`}
              >
                <div className="flex h-full w-full items-center justify-center rounded-2xl bg-surface-container">
                  <span className="material-symbols-outlined text-3xl text-primary">
                    psychology
                  </span>
                </div>
              </div>
              <h3 className="text-center text-lg font-bold text-on-surface">
                {keys ? t(keys.name) : p.name}
              </h3>
              <p className="mt-1 text-center text-xs font-semibold uppercase tracking-widest text-secondary">
                {keys ? t(keys.role) : p.role}
              </p>
              <p className="mt-3 text-center text-sm text-on-surface-variant">
                {keys ? t(keys.blurb) : p.blurb}
              </p>
              <div className="mt-6 flex gap-2">
                <Link
                  href={editorHref}
                  className="flex-1 rounded-xl border border-outline-variant/20 py-2.5 text-center text-xs font-bold text-on-surface transition-colors hover:bg-surface-container-high"
                >
                  {t("personas.edit")}
                </Link>
                <button
                  type="button"
                  className="flex-1 rounded-xl bg-surface-container-high py-2.5 text-xs font-bold text-on-surface-variant transition-colors hover:text-on-surface"
                >
                  {t("personas.duplicate")}
                </button>
              </div>
            </article>
          );
        })}
      </div>
    </>
  );
}
