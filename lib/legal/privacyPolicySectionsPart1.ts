import type { LegalSection } from "@/lib/legal/legalDocumentTypes";

export const privacyPolicySectionsPart1: LegalSection[] = [
  {
    id: "about",
    title: "1. About PostSiva",
    blocks: [
      {
        type: "paragraph",
        text: 'PostSiva ("we," "our," or "us") is a comprehensive social media management platform that enables businesses, content creators, and marketing professionals to manage multiple social media accounts from a unified dashboard. Our service allows users to schedule content, analyze performance, and streamline their social media workflows across platforms including TikTok, Instagram, Facebook, Twitter, LinkedIn, YouTube, and others.',
      },
    ],
  },
  {
    id: "information-collected",
    title: "2. Information We Collect",
    blocks: [],
    subsections: [
      {
        id: "account-information",
        title: "2.1 Account Information",
        blocks: [
          {
            type: "list",
            items: [
              "Email address and contact information",
              "Profile information (name, company, job title)",
              "Account credentials and authentication data",
              "Billing information and payment details",
              "Subscription and usage preferences",
            ],
          },
        ],
      },
      {
        id: "social-media-data",
        title: "2.2 Social Media Account Data",
        blocks: [
          {
            type: "list",
            items: [
              "OAuth access tokens from connected social media platforms",
              "Public profile information from connected accounts",
              "Content data (posts, images, videos, captions)",
              "Scheduling and publishing preferences",
              "Analytics data and performance metrics",
              "Audience insights and engagement statistics",
            ],
          },
        ],
      },
      {
        id: "usage-data",
        title: "2.3 Usage and Technical Data",
        blocks: [
          {
            type: "list",
            items: [
              "Platform usage statistics and feature utilization",
              "Device information and browser details",
              "IP addresses and location data",
              "Log files and error reports",
              "Performance and diagnostic information",
            ],
          },
        ],
      },
    ],
  },
  {
    id: "how-we-use",
    title: "3. How We Use Your Information",
    blocks: [
      {
        type: "paragraph",
        text: "We process your information for the following purposes:",
      },
      {
        type: "list",
        items: [
          "Provide social media management and scheduling services",
          "Publish content to your connected social media accounts",
          "Generate analytics reports and performance insights",
          "Facilitate team collaboration and workflow management",
          "Process payments, manage subscriptions, and provide customer support",
          "Analyze usage patterns to enhance features and user experience",
          "Send service updates, security alerts, and marketing communications (with consent)",
          "Meet regulatory requirements and protect against fraud",
        ],
      },
    ],
  },
  {
    id: "platform-integration",
    title: "4. Social Media Platform Integration",
    blocks: [
      {
        type: "list",
        items: [
          "We request only the minimum permissions necessary for our services",
          "OAuth tokens are encrypted and stored securely",
          "We respect the privacy settings and terms of each connected platform",
          "You can disconnect accounts at any time through your dashboard",
          "We do not access private messages or personal data beyond our scope",
          "Content posting is performed only with your explicit authorization",
        ],
      },
    ],
  },
  {
    id: "data-sharing",
    title: "5. Data Sharing and Disclosure",
    blocks: [
      {
        type: "paragraph",
        text: "We do not sell, rent, or trade your personal information. We may share data only in these circumstances:",
      },
      {
        type: "list",
        items: [
          "Connected Platforms: With social media platforms to publish your content",
          "Service Providers: With trusted third parties who assist in service delivery (payment processors, hosting providers)",
          "Legal Requirements: When required by law, court order, or to protect our rights",
          "Business Transfers: In connection with mergers, acquisitions, or asset sales (with notice)",
          "Consent: With your explicit permission for specific purposes",
        ],
      },
    ],
  },
  {
    id: "data-security",
    title: "6. Data Security",
    blocks: [
      {
        type: "list",
        items: [
          "Encryption: Data encrypted in transit (TLS 1.3) and at rest (AES-256)",
          "Access Controls: Role-based access with multi-factor authentication",
          "Infrastructure: Secure cloud hosting with regular security audits",
          "Monitoring: 24/7 security monitoring and incident response",
          "Compliance: SOC 2 Type II and ISO 27001 certified practices",
          "Regular Updates: Continuous security patches and vulnerability assessments",
        ],
      },
    ],
  },
  {
    id: "data-retention",
    title: "7. Data Retention",
    blocks: [
      {
        type: "list",
        items: [
          "Active Accounts: Data retained while your account remains active",
          "Content Data: Stored for service functionality and analytics (up to 2 years)",
          "Analytics Data: Aggregated data retained for business insights (up to 5 years)",
          "Deleted Accounts: Personal data deleted within 30 days of account closure",
          "Legal Requirements: Some data may be retained longer for compliance purposes",
        ],
      },
    ],
  },
  {
    id: "your-rights",
    title: "8. Your Rights and Controls",
    blocks: [
      {
        type: "list",
        items: [
          "Access: Request a copy of your personal data",
          "Correction: Update or correct inaccurate information",
          "Deletion: Request deletion of your personal data",
          "Portability: Export your data in a machine-readable format",
          "Restriction: Limit how we process your data",
          "Objection: Object to processing based on legitimate interests",
          "Withdrawal: Withdraw consent for specific processing activities",
        ],
      },
    ],
  },
  {
    id: "third-party-services",
    title: "9. Third-Party Services",
    blocks: [
      {
        type: "paragraph",
        text: "PostSiva integrates with various social media platforms and services:",
      },
      {
        type: "list",
        items: [
          "Social Platforms: TikTok, Instagram, Facebook, Twitter, LinkedIn, YouTube, Pinterest",
          "Payment Processors: Stripe, PayPal for secure payment processing",
          "Analytics Services: Google Analytics for usage insights",
          "Cloud Services: AWS, Cloudflare for hosting and content delivery",
        ],
      },
      {
        type: "paragraph",
        text: "Each third-party service has its own privacy policy governing their data practices.",
      },
    ],
  },
];
