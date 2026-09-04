import type { LegalDocument } from "@/lib/legal/legalDocumentTypes";
import { termsSectionsPart1 } from "@/lib/legal/termsOfServiceSectionsPart1";
import { termsSectionsPart2 } from "@/lib/legal/termsOfServiceSectionsPart2";

export const termsOfServiceDocument: LegalDocument = {
  title: "Terms of Service",
  lastUpdated: "October 7, 2025",
  effectiveDate: "October 7, 2025",
  notice:
    "By accessing or using PostSiva, you agree to be bound by these Terms of Service and our Privacy Policy.",
  toc: [
    { id: "acceptance", label: "1. Acceptance of Terms" },
    { id: "service-description", label: "2. Service Description" },
    { id: "user-accounts", label: "3. User Accounts and Registration" },
    { id: "social-connections", label: "4. Social Media Account Connections" },
    { id: "acceptable-use", label: "5. Acceptable Use Policy" },
    { id: "content-ip", label: "6. Content and Intellectual Property" },
    { id: "subscription", label: "7. Subscription and Payments" },
    { id: "availability", label: "8. Service Availability and Support" },
    { id: "data-privacy", label: "9. Data and Privacy" },
    { id: "termination", label: "10. Account Termination" },
    { id: "disclaimers", label: "11. Disclaimers and Warranties" },
    { id: "liability", label: "12. Limitation of Liability" },
    { id: "indemnification", label: "13. Indemnification" },
    { id: "third-party", label: "14. Third-Party Platforms and Services" },
    { id: "dispute-resolution", label: "15. Dispute Resolution" },
    { id: "changes", label: "16. Changes to Terms" },
    { id: "governing-law", label: "17. Governing Law and Jurisdiction" },
    { id: "contact", label: "18. Contact Information" },
    { id: "linkedin", label: "Third-Party Integrations (LinkedIn)" },
  ],
  sections: [...termsSectionsPart1, ...termsSectionsPart2],
  footer:
    "© 2025 PostSiva. All rights reserved. PostSiva is not affiliated with LinkedIn Corporation.",
};
