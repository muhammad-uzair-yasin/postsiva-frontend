"use client";

import Link from "next/link";

import type { LegalBlock, LegalDocument, LegalSection } from "@/lib/legal/legalDocumentTypes";
import { usePublicTranslations } from "@/lib/i18n/PublicLocaleProvider";

function LegalBlockView({ block }: { block: LegalBlock }): React.ReactElement {
  if (block.type === "paragraph") {
    return <p className="text-sm leading-relaxed text-[#475467]">{block.text}</p>;
  }
  if (block.type === "note") {
    return (
      <p className="rounded-xl border border-[#bfdbfe] bg-[#eff6ff] px-4 py-3 text-sm leading-relaxed text-[#111827]">
        {block.text}
      </p>
    );
  }
  return (
    <ul className="list-disc space-y-2 pl-5 text-sm leading-relaxed text-[#475467]">
      {block.items.map((item) => (
        <li key={item}>{item}</li>
      ))}
    </ul>
  );
}

function LegalSectionView({ section }: { section: LegalSection }): React.ReactElement {
  return (
    <section id={section.id} className="scroll-mt-28">
      <h2 className="text-xl font-bold text-[#111827]">{section.title}</h2>
      <div className="mt-4 space-y-4">
        {section.blocks.map((block, index) => (
          <LegalBlockView key={`${section.id}-block-${index}`} block={block} />
        ))}
      </div>
      {section.subsections?.map((sub) => (
        <div key={sub.id} id={sub.id} className="mt-6 scroll-mt-28">
          <h3 className="text-base font-semibold text-[#111827]">{sub.title}</h3>
          <div className="mt-3 space-y-3">
            {sub.blocks.map((block, index) => (
              <LegalBlockView key={`${sub.id}-block-${index}`} block={block} />
            ))}
          </div>
        </div>
      ))}
    </section>
  );
}

interface LegalDocumentViewProps {
  document: LegalDocument;
}

export function LegalDocumentView({ document }: LegalDocumentViewProps): React.ReactElement {
  const { t } = usePublicTranslations();

  return (
    <div className="mx-auto w-full max-w-[1280px] px-4 pb-20 pt-8 sm:px-10">
      <div className="rounded-2xl border border-[#dbe3ef] bg-white p-6 shadow-[0_18px_45px_rgba(15,23,42,0.08)] md:p-8">
        <div className="flex flex-wrap gap-x-6 gap-y-2 text-xs font-bold uppercase tracking-wider text-[#475467]">
          <span>
            {t("marketing.legalLastUpdated")}: {document.lastUpdated}
          </span>
          <span>
            {t("marketing.legalEffective")}: {document.effectiveDate}
          </span>
        </div>
        {document.notice ? (
          <p className="mt-6 rounded-xl border border-[#bfdbfe] bg-[#eff6ff] px-4 py-3 text-sm font-medium text-[#111827]">
            {document.notice}
          </p>
        ) : null}
        {document.intro ? (
          <p className="mt-6 text-sm leading-relaxed text-[#475467]">{document.intro}</p>
        ) : null}
      </div>

      <div className="mt-10 grid gap-10 lg:grid-cols-[240px_1fr]">
        <aside className="lg:sticky lg:top-28 lg:self-start">
          <p className="text-xs font-bold uppercase tracking-widest text-[#0058bc]">
            {t("marketing.legalToc")}
          </p>
          <nav aria-label={t("marketing.legalToc")} className="mt-4 max-h-[70vh] overflow-y-auto">
            <ol className="space-y-2 text-sm">
              {document.toc.map((item) => (
                <li key={item.id}>
                  <a
                    href={`#${item.id}`}
                    className="text-[#475467] transition-colors hover:text-[#0058bc]"
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ol>
          </nav>
        </aside>

        <article className="space-y-10 rounded-2xl border border-[#dbe3ef] bg-white p-6 shadow-[0_18px_45px_rgba(15,23,42,0.08)] md:p-10">
          {document.sections.map((section) => (
            <LegalSectionView key={section.id} section={section} />
          ))}
          {document.footer ? (
            <footer className="border-t border-[#e5e7eb] pt-8 text-sm text-[#475467]">
              {document.footer}
            </footer>
          ) : null}
        </article>
      </div>

      <p className="mt-10 text-center text-sm text-[#475467]">
        {t("marketing.legalQuestions")}{" "}
        <Link href="/contact" className="font-semibold text-[#0058bc] hover:underline">
          {t("marketing.legalContactSupport")}
        </Link>
      </p>
    </div>
  );
}
