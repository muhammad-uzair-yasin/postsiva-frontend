import type { LegalDocument } from "@/lib/legal/legalDocumentTypes";
import { privacyPolicyDocument } from "@/lib/legal/privacyPolicyContent";
import { referralPolicyDocument } from "@/lib/legal/referralPolicyContent";
import { refundPolicyDocument } from "@/lib/legal/refundPolicyContent";
import { termsOfServiceDocument } from "@/lib/legal/termsOfServiceContent";
import {
  privacyPolicyDocumentBs,
  referralPolicyDocumentBs,
  refundPolicyDocumentBs,
  termsOfServiceDocumentBs,
} from "@/lib/legal/bs";
import type { PublicLocale } from "@/lib/i18n/publicLocaleStorage";

export type LegalDocId = "terms" | "privacy" | "refund" | "referral";

const EN: Record<LegalDocId, LegalDocument> = {
  terms: termsOfServiceDocument,
  privacy: privacyPolicyDocument,
  refund: refundPolicyDocument,
  referral: referralPolicyDocument,
};

const BS: Record<LegalDocId, LegalDocument> = {
  terms: termsOfServiceDocumentBs,
  privacy: privacyPolicyDocumentBs,
  refund: refundPolicyDocumentBs,
  referral: referralPolicyDocumentBs,
};

export function getLegalDocument(id: LegalDocId, locale: PublicLocale): LegalDocument {
  return locale === "bs" ? BS[id] : EN[id];
}
