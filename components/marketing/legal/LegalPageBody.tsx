"use client";

import { LegalDocumentView } from "@/components/marketing/legal/LegalDocumentView";
import {
  getLegalDocument,
  type LegalDocId,
} from "@/lib/legal/getLegalDocument";
import {
  usePublicLocale,
  usePublicTranslations,
} from "@/lib/i18n/PublicLocaleProvider";

type Props = {
  docId: LegalDocId;
  eyebrowKey: string;
  titleKey: string;
  descriptionKey: string;
};

/** Localized legal page body (intro + document switched by public locale). */
export function LegalPageBody({
  docId,
  eyebrowKey,
  titleKey,
  descriptionKey,
}: Props): React.ReactElement {
  const locale = usePublicLocale();
  const { t } = usePublicTranslations();
  const document = getLegalDocument(docId, locale);

  return (
    <>
      <section className="mx-auto w-full max-w-[1280px] px-4 pb-12 pt-28 text-center sm:px-10 sm:pt-32 md:pt-40">
        <div className="border-b border-[#d7e1ec] pb-10">
          <p className="text-xs font-bold uppercase tracking-widest text-[#0058bc]">
            {t(eyebrowKey)}
          </p>
          <h1 className="mt-4 text-4xl font-extrabold text-[#111827] sm:text-5xl">
            {t(titleKey)}
          </h1>
          <p className="mx-auto mt-4 max-w-3xl text-base font-medium leading-7 text-[#475467] sm:text-lg">
            {t(descriptionKey)}
          </p>
        </div>
      </section>
      <LegalDocumentView document={document} />
    </>
  );
}
