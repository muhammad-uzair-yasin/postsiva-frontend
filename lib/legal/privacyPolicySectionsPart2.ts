import type { LegalSection } from "@/lib/legal/legalDocumentTypes";

export const privacyPolicySectionsPart2: LegalSection[] = [
  {
    id: "international-transfers",
    title: "10. International Data Transfers",
    blocks: [
      {
        type: "paragraph",
        text: "Your data may be processed in countries other than your residence. We ensure adequate protection through:",
      },
      {
        type: "list",
        items: [
          "Standard Contractual Clauses (SCCs) approved by the European Commission",
          "Adequacy decisions for countries with equivalent data protection",
          "Binding Corporate Rules for intra-group transfers",
          "Your explicit consent where required",
        ],
      },
    ],
  },
  {
    id: "children",
    title: "11. Children's Privacy",
    blocks: [
      {
        type: "paragraph",
        text: "PostSiva is not intended for users under 16 years of age. We do not knowingly collect personal information from children under 16. If we become aware of such collection, we will delete the information immediately.",
      },
    ],
  },
  {
    id: "cookies",
    title: "12. Cookies and Tracking Technologies",
    blocks: [
      {
        type: "paragraph",
        text: "We use cookies and similar technologies to:",
      },
      {
        type: "list",
        items: [
          "Maintain user sessions and preferences",
          "Analyze platform usage and performance",
          "Provide personalized experiences",
          "Ensure security and prevent fraud",
        ],
      },
      {
        type: "paragraph",
        text: "You can control cookie preferences through your browser settings.",
      },
    ],
  },
  {
    id: "policy-changes",
    title: "13. Changes to This Policy",
    blocks: [
      {
        type: "paragraph",
        text: "We may update this privacy policy to reflect changes in our practices or legal requirements. Material changes will be communicated through email notifications to registered users, prominent notices on our platform, and an updated effective date on this policy.",
      },
    ],
  },
  {
    id: "contact",
    title: "14. Contact Information",
    blocks: [
      {
        type: "paragraph",
        text: "For privacy-related questions, requests, or concerns, please contact us:",
      },
      {
        type: "list",
        items: [
          "Privacy Officer: privacy@postsiva.com",
          "General Support: support@postsiva.com",
          "Data Protection Officer: dpo@postsiva.com",
          "Legal Department: legal@postsiva.com",
        ],
      },
    ],
  },
  {
    id: "google-data",
    title: "15. Google User Data Usage and YouTube API Integration",
    blocks: [
      {
        type: "paragraph",
        text: "PostSiva integrates with Google APIs and YouTube Data API v3 to provide comprehensive YouTube management services. This section details how we access, use, and protect your Google user data in compliance with Google's API Services User Data Policy.",
      },
    ],
    subsections: [
      {
        id: "google-scopes",
        title: "15.1 Google OAuth Scopes and Permissions",
        blocks: [
          {
            type: "paragraph",
            text: "When you connect your Google/YouTube account to PostSiva, we request permissions including userinfo.email, userinfo.profile, openid, yt-analytics.readonly, youtube.readonly, youtube, youtube.force-ssl, and youtube.upload as needed for account identification, analytics, and content management.",
          },
        ],
      },
      {
        id: "google-data-use",
        title: "15.2 How We Use Google and YouTube Data",
        blocks: [
          {
            type: "list",
            items: [
              "Display channel information, video metadata, and playlists in your dashboard",
              "Enable uploading, scheduling, editing, and organizing YouTube videos",
              "Provide analytics reports and performance insights",
              "Offer AI-powered suggestions for titles, descriptions, tags, and thumbnails",
              "Facilitate team collaboration on your YouTube presence with your permission",
            ],
          },
        ],
      },
      {
        id: "google-security",
        title: "15.3 Data Security and Limited Use",
        blocks: [
          {
            type: "list",
            items: [
              "OAuth 2.0 authentication with AES-256 token encryption",
              "We never store your Google account passwords",
              "Google user data is used solely for providing and improving YouTube management services",
              "We do not sell, rent, or share Google user data with third parties for advertising",
              "We do not use Google user data for AI/ML model training without explicit consent",
            ],
          },
        ],
      },
      {
        id: "google-retention",
        title: "15.4 Data Retention and Deletion",
        blocks: [
          {
            type: "list",
            items: [
              "Analytics data cached for up to 30 days to improve dashboard performance",
              "Google user data deleted when you disconnect your Google account",
              "Complete removal of associated Google data within 30 days of account deletion",
            ],
          },
        ],
      },
    ],
  },
  {
    id: "linkedin-data",
    title: "16. Use of LinkedIn Data",
    blocks: [
      {
        type: "paragraph",
        text: "PostSiva uses LinkedIn APIs, including the LinkedIn Community Management API, to help users manage and publish content on LinkedIn in a secure and compliant manner.",
      },
    ],
    subsections: [
      {
        id: "linkedin-access",
        title: "16.1 Data We Access from LinkedIn",
        blocks: [
          {
            type: "list",
            items: [
              "LinkedIn Page or Profile ID",
              "Post content and metadata (text, media references, timestamps)",
              "Comments and reactions on posts",
              "Basic engagement metrics (likes, comments count)",
              "Page or profile name and public information required for publishing",
            ],
          },
          {
            type: "note",
            text: "We do NOT access private messages, passwords, or sensitive personal data.",
          },
        ],
      },
      {
        id: "linkedin-use",
        title: "16.2 How We Use LinkedIn Data",
        blocks: [
          {
            type: "list",
            items: [
              "Create, schedule, publish, and manage LinkedIn posts",
              "Display post performance and engagement insights",
              "Allow users to respond to comments and manage reactions",
              "Improve content workflow and productivity for users",
            ],
          },
          {
            type: "paragraph",
            text: "We do not sell, rent, or share LinkedIn data with third parties.",
          },
        ],
      },
      {
        id: "linkedin-control",
        title: "16.3 User Control & Data Deletion",
        blocks: [
          {
            type: "list",
            items: [
              "Disconnect your LinkedIn account from PostSiva at any time",
              "Request deletion of stored LinkedIn-related data",
              "Control permissions directly from your LinkedIn account settings",
            ],
          },
        ],
      },
    ],
  },
  {
    id: "chrome-extension",
    title: "17. Chrome Extension Data Usage",
    blocks: [
      {
        type: "paragraph",
        text: "PostSiva offers a Chrome browser extension that enhances your LinkedIn experience. We access LinkedIn content only when you actively use the extension to perform actions such as reposting.",
      },
    ],
    subsections: [
      {
        id: "extension-access",
        title: "17.1 LinkedIn Data Access",
        blocks: [
          {
            type: "list",
            items: [
              "The extension accesses LinkedIn posts only when you explicitly initiate an action",
              "We do not collect or access LinkedIn data in the background",
              "No automatic scraping or passive data collection occurs",
            ],
          },
        ],
      },
      {
        id: "extension-backend",
        title: "17.2 Backend Data Transfer",
        blocks: [
          {
            type: "paragraph",
            text: "To provide core functionality, the extension sends necessary data to our backend services at https://backend.postsiva.com. All data transfers are encrypted using HTTPS/TLS protocols.",
          },
        ],
      },
      {
        id: "extension-collected",
        title: "17.3 Data We Collect Through the Extension",
        blocks: [
          {
            type: "list",
            items: [
              "Content you choose to repost: text, images, videos, and links from LinkedIn posts you select",
              "Basic usage data: extension interactions, feature usage, and error logs",
              "Account-related data: authentication tokens and user ID if you sign in through the extension",
              "Browser information: browser version and extension version for compatibility",
            ],
          },
          {
            type: "paragraph",
            text: "We do not collect browsing history outside of LinkedIn, passwords, private messages, or data from other websites.",
          },
        ],
      },
      {
        id: "extension-control",
        title: "17.4 User Control",
        blocks: [
          {
            type: "list",
            items: [
              "Uninstall the extension at any time through Chrome settings",
              "Disconnect your PostSiva account from the extension",
              "Request deletion of extension data by contacting privacy@postsiva.com",
            ],
          },
        ],
      },
    ],
  },
];
