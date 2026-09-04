import type { LegalDocument } from "@/lib/legal/legalDocumentTypes";
import { privacyPolicySectionsPart1Bs } from "@/lib/legal/bs/privacyPolicySectionsPart1";
import { privacyPolicySectionsPart2Bs } from "@/lib/legal/bs/privacyPolicySectionsPart2";

export const privacyPolicyDocumentBs: LegalDocument = {
  title: "Politika privatnosti",
  lastUpdated: "17. mart 2026.",
  effectiveDate: "17. mart 2026.",
  toc: [
    { id: "about", label: "1. O PostSiva" },
    { id: "information-collected", label: "2. Podaci koje prikupljamo" },
    { id: "how-we-use", label: "3. Kako koristimo vaše podatke" },
    { id: "platform-integration", label: "4. Integracija s platformama društvenih mreža" },
    { id: "data-sharing", label: "5. Dijeljenje i otkrivanje podataka" },
    { id: "data-security", label: "6. Sigurnost podataka" },
    { id: "data-retention", label: "7. Zadržavanje podataka" },
    { id: "your-rights", label: "8. Vaša prava i kontrole" },
    { id: "third-party-services", label: "9. Usluge trećih strana" },
    { id: "international-transfers", label: "10. Međunarodni prijenosi podataka" },
    { id: "children", label: "11. Privatnost djece" },
    { id: "cookies", label: "12. Kolačići i tehnologije praćenja" },
    { id: "policy-changes", label: "13. Izmjene ove politike" },
    { id: "contact", label: "14. Kontakt informacije" },
    { id: "google-data", label: "15. Korištenje Google korisničkih podataka" },
    { id: "linkedin-data", label: "16. Korištenje LinkedIn podataka" },
    { id: "chrome-extension", label: "17. Korištenje podataka Chrome ekstenzije" },
  ],
  sections: [...privacyPolicySectionsPart1Bs, ...privacyPolicySectionsPart2Bs],
  footer:
    "Ova politika privatnosti ispunjava zahtjeve GDPR-a, CCPA-a, PIPEDA-a, Google API Services User Data Policy i drugih primjenjivih propisa o privatnosti. PostSiva nije povezana s LinkedIn Corporation. © 2025 PostSiva. Sva prava zadržana.",
};
