import type { LegalDocument, LegalSection } from "@/lib/legal/legalDocumentTypes";

const termsSectionsPart1: LegalSection[] = [
  {
    id: "acceptance",
    title: "1. Acceptance of Terms",
    blocks: [
      {
        type: "paragraph",
        text: 'These Terms of Service ("Terms") constitute a legally binding agreement between you ("User," "you," or "your") and PostSiva ("Company," "we," "our," or "us") governing your access to and use of the PostSiva platform, website, and related services (collectively, the "Service").',
      },
      {
        type: "paragraph",
        text: "By creating an account, accessing our platform, or using any part of our Service, you acknowledge that you have read, understood, and agree to be bound by these Terms and our Privacy Policy. If you do not agree to these Terms, you must not access or use our Service.",
      },
    ],
  },
  {
    id: "service-description",
    title: "2. Service Description",
    blocks: [
      {
        type: "paragraph",
        text: "PostSiva is a comprehensive social media management platform that provides the following services:",
      },
      {
        type: "list",
        items: [
          "Multi-Platform Management: Connect and manage multiple social media accounts from a unified dashboard",
          "Content Scheduling: Schedule posts across various social media platforms including TikTok, Instagram, Facebook, Twitter, LinkedIn, and YouTube",
          "Analytics and Insights: Track performance metrics, engagement rates, and audience analytics",
          "Team Collaboration: Enable multiple users to collaborate on content creation and approval workflows",
          "Content Calendar: Visual planning and organization of social media content",
        ],
      },
    ],
  },
  {
    id: "user-accounts",
    title: "3. User Accounts and Registration",
    blocks: [],
    subsections: [
      {
        id: "eligibility",
        title: "3.1 Eligibility",
        blocks: [
          {
            type: "list",
            items: [
              "You must be at least 16 years old to create an account",
              "You must provide accurate, current, and complete information during registration",
              "You must have the legal capacity to enter into binding agreements",
              "Business accounts must be registered by authorized representatives",
            ],
          },
        ],
      },
      {
        id: "account-security",
        title: "3.2 Account Security",
        blocks: [
          {
            type: "list",
            items: [
              "You are responsible for maintaining the confidentiality of your account credentials",
              "You must notify us immediately of any unauthorized access or security breaches",
              "You are liable for all activities that occur under your account",
              "We recommend enabling two-factor authentication for enhanced security",
            ],
          },
        ],
      },
      {
        id: "account-restrictions",
        title: "3.3 Account Restrictions",
        blocks: [
          {
            type: "list",
            items: [
              "One person or entity may not maintain multiple accounts without authorization",
              "Accounts may not be transferred, sold, or shared with third parties",
              "False or misleading registration information may result in account suspension",
            ],
          },
        ],
      },
    ],
  },
  {
    id: "social-connections",
    title: "4. Social Media Account Connections",
    blocks: [],
    subsections: [
      {
        id: "authorization",
        title: "4.1 Authorization Requirements",
        blocks: [
          {
            type: "list",
            items: [
              "You must own or have explicit authorization to manage connected social media accounts",
              "You grant PostSiva permission to access and post content on your behalf",
              "You remain fully responsible for all content posted through our platform",
              "You must comply with the terms of service of each connected platform",
            ],
          },
        ],
      },
      {
        id: "platform-integration",
        title: "4.2 Platform Integration",
        blocks: [
          {
            type: "list",
            items: [
              "We use official APIs and OAuth protocols for secure connections",
              "Access tokens are encrypted and stored securely",
              "You can revoke access permissions at any time through your account settings",
              "We are not liable for changes to third-party platform APIs or policies",
            ],
          },
        ],
      },
    ],
  },
  {
    id: "acceptable-use",
    title: "5. Acceptable Use Policy",
    blocks: [
      {
        type: "paragraph",
        text: "You agree NOT to use our Service for any of the following purposes:",
      },
      {
        type: "list",
        items: [
          "Illegal Content: Posting content that violates local, national, or international laws",
          "Harmful Content: Sharing content that promotes violence, harassment, or discrimination",
          "Intellectual Property Violations: Infringing on copyrights, trademarks, or other IP rights",
          "Spam and Abuse: Sending unsolicited messages or engaging in abusive behavior",
          "Platform Violations: Violating the terms of service of connected social media platforms",
          "Security Threats: Distributing malware, viruses, or attempting to breach security",
          "Impersonation: Misrepresenting your identity or affiliation",
          "Automated Abuse: Using bots or scripts to manipulate engagement metrics",
        ],
      },
    ],
  },
  {
    id: "content-ip",
    title: "6. Content and Intellectual Property",
    blocks: [],
    subsections: [
      {
        id: "your-content",
        title: "6.1 Your Content",
        blocks: [
          {
            type: "list",
            items: [
              "You retain ownership of all content you create and upload",
              "You grant PostSiva a limited license to process, store, and distribute your content as necessary to provide our services",
              "You are solely responsible for ensuring your content complies with applicable laws and platform policies",
              "You warrant that you have all necessary rights to the content you upload",
            ],
          },
        ],
      },
      {
        id: "our-ip",
        title: "6.2 Our Intellectual Property",
        blocks: [
          {
            type: "list",
            items: [
              "PostSiva platform, software, and technology remain our exclusive property",
              "Our trademarks, logos, and brand elements may not be used without permission",
              "You may not reverse engineer, decompile, or attempt to extract our source code",
            ],
          },
        ],
      },
      {
        id: "content-moderation",
        title: "6.3 Content Moderation",
        blocks: [
          {
            type: "list",
            items: [
              "We reserve the right to review and remove content that violates these Terms",
              "Content removal does not imply liability or obligation to monitor all user content",
              "We may use automated systems to detect policy violations",
            ],
          },
        ],
      },
    ],
  },
  {
    id: "subscription",
    title: "7. Subscription and Payments",
    blocks: [],
    subsections: [
      {
        id: "subscription-plans",
        title: "7.1 Subscription Plans",
        blocks: [
          {
            type: "list",
            items: [
              "Various subscription tiers are available with different features and limitations",
              "Subscription fees are billed in advance on a monthly or annual basis",
              "Free trial periods may be offered at our discretion",
              "Enterprise plans may include custom terms and pricing",
            ],
          },
        ],
      },
      {
        id: "payment-terms",
        title: "7.2 Payment Terms",
        blocks: [
          {
            type: "list",
            items: [
              "All fees are non-refundable unless required by applicable law",
              "Prices may change with 30 days' advance notice to existing subscribers",
              "Failed payments may result in service suspension or account termination",
              "You are responsible for all applicable taxes and fees",
            ],
          },
        ],
      },
      {
        id: "cancellation-refunds",
        title: "7.3 Cancellation and Refunds",
        blocks: [
          {
            type: "list",
            items: [
              "You may cancel your subscription at any time through your account settings",
              "Cancellation takes effect at the end of the current billing period",
              "No refunds are provided for partial billing periods",
              "Data export options are available before account closure",
            ],
          },
        ],
      },
    ],
  },
  {
    id: "availability",
    title: "8. Service Availability and Support",
    blocks: [],
    subsections: [
      {
        id: "service-level",
        title: "8.1 Service Level",
        blocks: [
          {
            type: "list",
            items: [
              "We strive to maintain 99.9% uptime but cannot guarantee uninterrupted service",
              "Scheduled maintenance will be announced in advance when possible",
              "Emergency maintenance may occur without prior notice",
              "Service interruptions due to third-party platform issues are beyond our control",
            ],
          },
        ],
      },
      {
        id: "customer-support",
        title: "8.2 Customer Support",
        blocks: [
          {
            type: "list",
            items: [
              "Support is provided via email, chat, and help documentation",
              "Response times vary based on subscription tier and issue complexity",
              "Premium support options are available for enterprise customers",
            ],
          },
        ],
      },
    ],
  },
  {
    id: "data-privacy",
    title: "9. Data and Privacy",
    blocks: [
      {
        type: "list",
        items: [
          "Your privacy rights and our data practices are governed by our Privacy Policy",
          "We implement industry-standard security measures to protect your data",
          "You can export your data at any time through your account dashboard",
          "Data retention periods are specified in our Privacy Policy",
          "We comply with GDPR, CCPA, and other applicable privacy regulations",
        ],
      },
    ],
  },
  {
    id: "termination",
    title: "10. Account Termination",
    blocks: [],
    subsections: [
      {
        id: "termination-by-you",
        title: "10.1 Termination by You",
        blocks: [
          {
            type: "list",
            items: [
              "You may terminate your account at any time through your account settings",
              "Data export options are available before account closure",
              "Subscription fees are not refunded upon voluntary termination",
            ],
          },
        ],
      },
      {
        id: "termination-by-us",
        title: "10.2 Termination by Us",
        blocks: [
          {
            type: "paragraph",
            text: "We may suspend or terminate your account if you:",
          },
          {
            type: "list",
            items: [
              "Violate these Terms of Service or our Acceptable Use Policy",
              "Engage in fraudulent or illegal activities",
              "Fail to pay subscription fees after notice and cure period",
              "Pose a security risk to our platform or other users",
            ],
          },
        ],
      },
    ],
  },
];

export { termsSectionsPart1 };
