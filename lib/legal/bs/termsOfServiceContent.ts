import type { LegalDocument } from "@/lib/legal/legalDocumentTypes";
import { termsSectionsPart1Bs } from "@/lib/legal/bs/termsOfServiceSectionsPart1";
import { termsSectionsPart2Bs } from "@/lib/legal/bs/termsOfServiceSectionsPart2";

export const termsOfServiceDocumentBs: LegalDocument = {
  title: "Uslovi korištenja",
  lastUpdated: "7. oktobar 2025.",
  effectiveDate: "7. oktobar 2025.",
  notice:
    "Pristupanjem ili korištenjem PostSiva pristajete da budete obavezani ovim Uslovima korištenja i našom Politikom privatnosti.",
  toc: [
    { id: "acceptance", label: "1. Prihvatanje uslova" },
    { id: "service-description", label: "2. Opis usluge" },
    { id: "user-accounts", label: "3. Korisnički računi i registracija" },
    { id: "social-connections", label: "4. Povezivanje naloga na društvenim mrežama" },
    { id: "acceptable-use", label: "5. Politika prihvatljive upotrebe" },
    { id: "content-ip", label: "6. Sadržaj i intelektualna svojina" },
    { id: "subscription", label: "7. Pretplata i plaćanja" },
    { id: "availability", label: "8. Dostupnost usluge i podrška" },
    { id: "data-privacy", label: "9. Podaci i privatnost" },
    { id: "termination", label: "10. Ukidanje računa" },
    { id: "disclaimers", label: "11. Odricanja i garancije" },
    { id: "liability", label: "12. Ograničenje odgovornosti" },
    { id: "indemnification", label: "13. Naknada štete" },
    { id: "third-party", label: "14. Platforme i usluge trećih strana" },
    { id: "dispute-resolution", label: "15. Rješavanje sporova" },
    { id: "changes", label: "16. Izmjene uslova" },
    { id: "governing-law", label: "17. Mjerodavno pravo i nadležnost" },
    { id: "contact", label: "18. Kontakt informacije" },
    { id: "linkedin", label: "Integracije trećih strana (LinkedIn)" },
  ],
  sections: [...termsSectionsPart1Bs, ...termsSectionsPart2Bs],
  footer:
    "© 2025 PostSiva. Sva prava zadržana. PostSiva nije povezana s LinkedIn Corporation.",
};
