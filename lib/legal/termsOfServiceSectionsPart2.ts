import type { LegalSection } from "@/lib/legal/legalDocumentTypes";

const termsSectionsPart2: LegalSection[] = [
  {
    id: "disclaimers",
    title: "11. Disclaimers and Warranties",
    blocks: [
      {
        type: "list",
        items: [
          'Our Service is provided "as is" without warranties of any kind',
          "We do not guarantee successful posting to all social media platforms",
          "Third-party platforms may change their APIs, policies, or terms without notice",
          "We are not responsible for content performance, engagement rates, or business outcomes",
          "Internet connectivity and device compatibility may affect service functionality",
        ],
      },
    ],
  },
  {
    id: "liability",
    title: "12. Limitation of Liability",
    blocks: [
      {
        type: "paragraph",
        text: "To the maximum extent permitted by applicable law:",
      },
      {
        type: "list",
        items: [
          "Our total liability is limited to the amount you paid for the Service in the 12 months preceding the claim",
          "We are not liable for indirect, incidental, consequential, or punitive damages",
          "We are not responsible for losses caused by third-party platform actions or policies",
          "Business interruption, lost profits, or data loss are excluded from our liability",
          "Some jurisdictions do not allow liability limitations, so these may not apply to you",
        ],
      },
    ],
  },
  {
    id: "indemnification",
    title: "13. Indemnification",
    blocks: [
      {
        type: "paragraph",
        text: "You agree to indemnify, defend, and hold harmless PostSiva, its officers, directors, employees, and agents from any claims, damages, losses, or expenses (including reasonable attorney fees) arising from:",
      },
      {
        type: "list",
        items: [
          "Your use of the Service or violation of these Terms",
          "Content you post or share through our platform",
          "Your violation of third-party rights or applicable laws",
          "Unauthorized access to your account due to your negligence",
        ],
      },
    ],
  },
  {
    id: "third-party",
    title: "14. Third-Party Platforms and Services",
    blocks: [
      {
        type: "list",
        items: [
          "Our Service integrates with various social media platforms and third-party services",
          "Each platform has its own terms of service, privacy policies, and acceptable use policies",
          "You must comply with all applicable third-party terms and policies",
          "We are not responsible for third-party platform changes, outages, or policy violations",
          "Platform integrations may be modified or discontinued based on API availability",
        ],
      },
    ],
  },
  {
    id: "dispute-resolution",
    title: "15. Dispute Resolution",
    blocks: [],
    subsections: [
      {
        id: "informal-resolution",
        title: "15.1 Informal Resolution",
        blocks: [
          {
            type: "paragraph",
            text: "Before initiating formal proceedings, parties agree to attempt good-faith resolution through direct communication.",
          },
        ],
      },
      {
        id: "arbitration",
        title: "15.2 Binding Arbitration",
        blocks: [
          {
            type: "list",
            items: [
              "Disputes will be resolved through binding arbitration rather than court proceedings",
              "Arbitration will be conducted under applicable arbitration rules",
              "Class action lawsuits and jury trials are waived",
              "Some jurisdictions may not enforce arbitration clauses",
            ],
          },
        ],
      },
    ],
  },
  {
    id: "changes",
    title: "16. Changes to Terms",
    blocks: [
      {
        type: "list",
        items: [
          "We may update these Terms periodically to reflect service changes or legal requirements",
          "Material changes will be communicated via email and platform notifications",
          "Continued use of the Service after changes constitutes acceptance of new Terms",
          "You may terminate your account if you disagree with updated Terms",
        ],
      },
    ],
  },
  {
    id: "governing-law",
    title: "17. Governing Law and Jurisdiction",
    blocks: [
      {
        type: "list",
        items: [
          "These Terms are governed by applicable laws in the jurisdiction where PostSiva operates",
          "International users may have additional rights under local laws",
        ],
      },
    ],
  },
  {
    id: "contact",
    title: "18. Contact Information",
    blocks: [
      {
        type: "paragraph",
        text: "For questions about these Terms of Service or legal matters:",
      },
      {
        type: "list",
        items: [
          "Legal Department: legal@postsiva.com",
          "General Support: support@postsiva.com",
          "Business Inquiries: business@postsiva.com",
          "Compliance Officer: compliance@postsiva.com",
        ],
      },
    ],
  },
  {
    id: "linkedin",
    title: "Third-Party Integrations (LinkedIn)",
    blocks: [
      {
        type: "paragraph",
        text: "PostSiva integrates with LinkedIn through official APIs to provide content publishing and management features.",
      },
      {
        type: "paragraph",
        text: "By connecting your LinkedIn account, you agree that:",
      },
      {
        type: "list",
        items: [
          "You authorize PostSiva to access LinkedIn data only for permitted actions",
          "You remain responsible for all content published through your LinkedIn account",
          "PostSiva acts as a technical platform, not a content owner",
        ],
      },
    ],
    subsections: [
      {
        id: "linkedin-responsibilities",
        title: "User Responsibilities",
        blocks: [
          {
            type: "list",
            items: [
              "Use PostSiva in compliance with LinkedIn's policies",
              "Not publish misleading, abusive, or prohibited content",
              "Ensure you have proper rights to post content on behalf of pages or profiles",
            ],
          },
          {
            type: "note",
            text: "PostSiva is not responsible for content violations or account restrictions imposed by LinkedIn.",
          },
        ],
      },
      {
        id: "linkedin-api",
        title: "API Usage & Limitations",
        blocks: [
          {
            type: "list",
            items: [
              "LinkedIn API access depends on LinkedIn approval and availability",
              "Features may change or be limited based on LinkedIn policy updates",
              "PostSiva does not guarantee uninterrupted API access",
            ],
          },
        ],
      },
      {
        id: "linkedin-termination",
        title: "Termination of Access",
        blocks: [
          {
            type: "paragraph",
            text: "PostSiva reserves the right to suspend or revoke LinkedIn integration if misuse is detected and to comply with LinkedIn requests related to policy enforcement. Users may disconnect LinkedIn integration at any time.",
          },
        ],
      },
      {
        id: "linkedin-disclaimer",
        title: "Disclaimer",
        blocks: [
          {
            type: "note",
            text: "PostSiva is an independent platform and is not affiliated with, endorsed by, or sponsored by LinkedIn. LinkedIn is a registered trademark of LinkedIn Corporation.",
          },
        ],
      },
    ],
  },
];

export { termsSectionsPart2 };
