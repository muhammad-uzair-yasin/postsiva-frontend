import type { LegalDocument } from "@/lib/legal/legalDocumentTypes";

export const referralPolicyDocument: LegalDocument = {
  title: "Referral Program Policy",
  lastUpdated: "July 14, 2026",
  effectiveDate: "July 14, 2026",
  intro:
    'This Referral Program Policy explains how PostSiva ("we," "our," or "us") rewards users who refer new customers. It should be read with our Terms of Service and Privacy Policy.',
  notice:
    "Participation in the Refer & Earn program means you agree to these rules. We may change or end the program at any time.",
  toc: [
    { id: "overview", label: "1. Overview" },
    { id: "eligibility", label: "2. Eligibility" },
    { id: "rewards", label: "3. Cash Rewards" },
    { id: "milestone", label: "4. Pro Month Milestone" },
    { id: "withdrawals", label: "5. Withdrawals" },
    { id: "prohibited", label: "6. Prohibited Conduct" },
    { id: "changes", label: "7. Changes" },
    { id: "contact", label: "8. Contact" },
  ],
  sections: [
    {
      id: "overview",
      title: "1. Overview",
      blocks: [
        {
          type: "paragraph",
          text: "Eligible users receive a unique referral link. When a new customer signs up with that link and completes a first paid subscription, you may earn a cash credit in your Postsiva referral wallet.",
        },
      ],
    },
    {
      id: "eligibility",
      title: "2. Eligibility",
      blocks: [
        {
          type: "list",
          items: [
            "You must have a verified Postsiva account.",
            "The referred person must be a new Postsiva user attributed to your link at signup.",
            "Self-referrals (using your own link for accounts you control) are not allowed.",
            "Each referred user can be attributed only once.",
          ],
        },
      ],
    },
    {
      id: "rewards",
      title: "3. Cash Rewards",
      blocks: [
        {
          type: "list",
          items: [
            "Starter plan ($10/mo): $0.25 USD per qualified first payment.",
            "Pro plan ($29/mo): $1.00 USD per qualified first payment.",
            "Rewards apply to the referred user's first successful paid month only — not renewals.",
            "Credits are added after successful payment confirmation (no waiting hold).",
            "Yearly checkouts earn the same flat amount (not multiplied by 12).",
          ],
        },
      ],
    },
    {
      id: "milestone",
      title: "4. Pro Month Milestone",
      blocks: [
        {
          type: "paragraph",
          text: "After you reach 10 credited paid referrals, you receive a one-time one-month Postsiva Pro entitlement at no charge, in addition to cash rewards. If you already have an active paid Pro subscription when you hit the milestone, we record the milestone as used without stacking an extra grant.",
        },
      ],
    },
    {
      id: "withdrawals",
      title: "5. Withdrawals",
      blocks: [
        {
          type: "list",
          items: [
            "Minimum withdrawal balance: $25.00 USD.",
            "Withdrawals are processed manually after you submit a request with payout details.",
            "We may review requests and reject those that appear fraudulent or incomplete.",
            "Processing is typically batched (for example monthly); timing is not guaranteed.",
          ],
        },
      ],
    },
    {
      id: "prohibited",
      title: "6. Prohibited Conduct",
      blocks: [
        {
          type: "paragraph",
          text: "You may not create fake accounts, use stolen payment methods, spam, or otherwise game the program. We may reverse credits, freeze wallets, deny withdrawals, or suspend accounts for abuse.",
        },
      ],
    },
    {
      id: "changes",
      title: "7. Changes",
      blocks: [
        {
          type: "paragraph",
          text: "Reward amounts, milestone offers, and payout rules may change. Material updates will be reflected on this page and/or in product notices.",
        },
      ],
    },
    {
      id: "contact",
      title: "8. Contact",
      blocks: [
        {
          type: "paragraph",
          text: "Questions about referrals or withdrawals: support@postsiva.com",
        },
      ],
    },
  ],
  footer: "© 2026 PostSiva. All rights reserved.",
};
