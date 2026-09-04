import type { LegalDocument } from "@/lib/legal/legalDocumentTypes";
import { privacyPolicySectionsPart1 } from "@/lib/legal/privacyPolicySectionsPart1";
import { privacyPolicySectionsPart2 } from "@/lib/legal/privacyPolicySectionsPart2";

export const privacyPolicyDocument: LegalDocument = {
  title: "Privacy Policy",
  lastUpdated: "March 17, 2026",
  effectiveDate: "March 17, 2026",
  toc: [
    { id: "about", label: "1. About PostSiva" },
    { id: "information-collected", label: "2. Information We Collect" },
    { id: "how-we-use", label: "3. How We Use Your Information" },
    { id: "platform-integration", label: "4. Social Media Platform Integration" },
    { id: "data-sharing", label: "5. Data Sharing and Disclosure" },
    { id: "data-security", label: "6. Data Security" },
    { id: "data-retention", label: "7. Data Retention" },
    { id: "your-rights", label: "8. Your Rights and Controls" },
    { id: "third-party-services", label: "9. Third-Party Services" },
    { id: "international-transfers", label: "10. International Data Transfers" },
    { id: "children", label: "11. Children's Privacy" },
    { id: "cookies", label: "12. Cookies and Tracking Technologies" },
    { id: "policy-changes", label: "13. Changes to This Policy" },
    { id: "contact", label: "14. Contact Information" },
    { id: "google-data", label: "15. Google User Data Usage" },
    { id: "linkedin-data", label: "16. Use of LinkedIn Data" },
    { id: "chrome-extension", label: "17. Chrome Extension Data Usage" },
  ],
  sections: [...privacyPolicySectionsPart1, ...privacyPolicySectionsPart2],
  footer:
    "This privacy policy complies with GDPR, CCPA, PIPEDA, Google API Services User Data Policy, and other applicable privacy regulations. PostSiva is not affiliated with LinkedIn Corporation. © 2025 PostSiva. All rights reserved.",
};
