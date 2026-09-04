import type { LegalDocument } from "@/lib/legal/legalDocumentTypes";

export const refundPolicyDocument: LegalDocument = {
  title: "Refund Policy",
  lastUpdated: "June 18, 2026",
  effectiveDate: "June 18, 2026",
  intro:
    'This Refund Policy explains how PostSiva ("we," "our," or "us") handles subscription payments, cancellations, and refund requests for our social media management platform and related services. This policy should be read together with our Terms of Service and Privacy Policy.',
  notice:
    "By purchasing a PostSiva subscription, you acknowledge that you have read, understood, and agree to this Refund Policy.",
  toc: [
    { id: "introduction", label: "1. Introduction" },
    { id: "scope", label: "2. Scope and Applicability" },
    { id: "billing", label: "3. Subscription Plans and Billing" },
    { id: "free-trial", label: "4. Free Trials" },
    { id: "cancellation", label: "5. Cancellation Policy" },
    { id: "eligibility", label: "6. Refund Eligibility" },
    { id: "non-refundable", label: "7. Non-Refundable Items" },
    { id: "how-to-request", label: "8. How to Request a Refund" },
    { id: "processing", label: "9. Refund Processing Timeline" },
    { id: "chargebacks", label: "10. Chargebacks and Payment Disputes" },
    { id: "plan-changes", label: "11. Plan Changes and Downgrades" },
    { id: "service-outages", label: "12. Service Outages" },
    { id: "contact", label: "13. Contact Information" },
  ],
  sections: [
    {
      id: "introduction",
      title: "1. Introduction",
      blocks: [
        {
          type: "paragraph",
          text: "PostSiva offers subscription-based access to our unified social media management platform, including content scheduling, analytics, AI-assisted workflows, team collaboration tools, and integrations with major social networks. This Refund Policy sets out the conditions under which payments may be refunded and how cancellations are handled.",
        },
      ],
    },
    {
      id: "scope",
      title: "2. Scope and Applicability",
      blocks: [
        {
          type: "paragraph",
          text: "This policy applies to all paid subscriptions purchased directly through the PostSiva website or authorized billing channels, including monthly and annual plans (Starter, Creator, Agency, and Enterprise tiers). It covers subscription fees, add-on purchases billed by PostSiva, and applicable taxes collected at checkout.",
        },
        {
          type: "paragraph",
          text: "This policy does not cover third-party platform fees, app store purchases processed outside PostSiva, or services provided by integrated partners under their own billing terms.",
        },
      ],
    },
    {
      id: "billing",
      title: "3. Subscription Plans and Billing",
      blocks: [
        {
          type: "list",
          items: [
            "Subscription fees are billed in advance at the start of each billing cycle (monthly or annual)",
            "All prices are displayed in USD unless otherwise stated at checkout",
            "Payment is processed securely through our authorized payment partners (e.g., Stripe, PayPal)",
            "Failed or declined payments may result in temporary service suspension until payment is resolved",
            "You are responsible for keeping your billing information current and accurate",
          ],
        },
      ],
    },
    {
      id: "free-trial",
      title: "4. Free Trials",
      blocks: [
        {
          type: "paragraph",
          text: "PostSiva may offer free trial periods for eligible plans at our discretion. During a free trial, you can access designated features without charge until the trial ends.",
        },
        {
          type: "list",
          items: [
            "If you do not cancel before the trial ends, your selected paid plan will begin and your payment method will be charged automatically",
            "Only one free trial per customer or organization unless otherwise approved by PostSiva",
            "We may require a valid payment method on file to start a trial",
            "No charges apply during an active free trial unless you upgrade to a paid plan early",
          ],
        },
      ],
    },
    {
      id: "cancellation",
      title: "5. Cancellation Policy",
      blocks: [
        {
          type: "paragraph",
          text: "You may cancel your subscription at any time through your account settings under Settings → Billing, or by contacting support@postsiva.com.",
        },
        {
          type: "list",
          items: [
            "Cancellation takes effect at the end of your current billing period",
            "You retain access to paid features until the end of the paid period",
            "No further charges will be made after cancellation, unless you reactivate or purchase a new plan",
            "Canceling does not automatically delete your account or connected social profiles",
            "We recommend exporting your data before your subscription expires",
          ],
        },
      ],
    },
    {
      id: "eligibility",
      title: "6. Refund Eligibility",
      blocks: [
        {
          type: "paragraph",
          text: "As a general rule, all subscription fees are non-refundable once a billing period has started. However, PostSiva may issue refunds in the following circumstances:",
        },
        {
          type: "list",
          items: [
            "Duplicate or erroneous charges processed by PostSiva or our payment provider",
            "Unauthorized transactions reported promptly and verified by our billing team",
            "Extended service unavailability caused solely by PostSiva infrastructure (see Section 12)",
            "Where a refund is required by applicable consumer protection or payment regulations in your jurisdiction",
            "At PostSiva's sole discretion for documented billing errors or exceptional circumstances",
          ],
        },
        {
          type: "note",
          text: "Refund requests must be submitted within 14 days of the charge date unless a longer period is required by law in your region.",
        },
      ],
    },
    {
      id: "non-refundable",
      title: "7. Non-Refundable Items",
      blocks: [
        {
          type: "paragraph",
          text: "The following are not eligible for refunds:",
        },
        {
          type: "list",
          items: [
            "Partial billing periods after cancellation (including unused days in a monthly or annual cycle)",
            "Subscription fees after you have used paid features during the billing period",
            "Add-on credits, AI usage packs, or one-time purchases once delivered or consumed",
            "Fees arising from third-party social platform API limitations or account restrictions",
            "Taxes, currency conversion fees, or bank charges imposed by your financial institution",
            "Accounts terminated for violation of our Terms of Service or Acceptable Use Policy",
          ],
        },
      ],
    },
    {
      id: "how-to-request",
      title: "8. How to Request a Refund",
      blocks: [
        {
          type: "paragraph",
          text: "To request a refund, contact our billing team with the following information:",
        },
        {
          type: "list",
          items: [
            "Account email address associated with your PostSiva subscription",
            "Date and amount of the charge in question",
            "Transaction or invoice reference number (if available)",
            "Clear description of the reason for your refund request",
          ],
        },
        {
          type: "paragraph",
          text: "Email: billing@postsiva.com or support@postsiva.com with the subject line \"Refund Request — [Your Account Email]\". We will review your request and respond within 5 business days.",
        },
      ],
    },
    {
      id: "processing",
      title: "9. Refund Processing Timeline",
      blocks: [
        {
          type: "list",
          items: [
            "Approved refunds are processed to the original payment method used at purchase",
            "Refunds typically appear within 5–10 business days, depending on your bank or card issuer",
            "If the original payment method is unavailable, we may offer account credit or an alternative refund method",
            "You will receive email confirmation once a refund has been initiated",
          ],
        },
      ],
    },
    {
      id: "chargebacks",
      title: "10. Chargebacks and Payment Disputes",
      blocks: [
        {
          type: "paragraph",
          text: "We encourage you to contact us at billing@postsiva.com before initiating a chargeback with your bank or payment provider. Chargebacks opened without first attempting resolution may result in temporary account suspension while the dispute is investigated.",
        },
        {
          type: "list",
          items: [
            "We will provide transaction records and service usage logs to payment processors when required",
            "Fraudulent chargebacks may lead to permanent account termination",
            "Resolved chargebacks in PostSiva's favor may reinstate outstanding subscription balances",
          ],
        },
      ],
    },
    {
      id: "plan-changes",
      title: "11. Plan Changes and Downgrades",
      blocks: [
        {
          type: "list",
          items: [
            "Upgrades take effect immediately; you will be charged a prorated amount for the remainder of the billing cycle",
            "Downgrades take effect at the start of the next billing cycle",
            "No refunds or credits are issued for downgrades during an active billing period",
            "Annual plan changes may be subject to additional terms displayed at checkout",
          ],
        },
      ],
    },
    {
      id: "service-outages",
      title: "12. Service Outages",
      blocks: [
        {
          type: "paragraph",
          text: "If PostSiva experiences a material service outage lasting more than 72 consecutive hours due to issues within our control (excluding scheduled maintenance, third-party platform API outages, or force majeure events), eligible customers on affected paid plans may request a prorated credit or refund for the affected period.",
        },
        {
          type: "paragraph",
          text: "Outages caused by connected social networks, internet service providers, or user-side configuration issues are not covered under this section.",
        },
      ],
    },
    {
      id: "contact",
      title: "13. Contact Information",
      blocks: [
        {
          type: "paragraph",
          text: "For billing, refund, or cancellation questions, please contact:",
        },
        {
          type: "list",
          items: [
            "Billing & Refunds: billing@postsiva.com",
            "General Support: support@postsiva.com",
            "Legal Department: legal@postsiva.com",
          ],
        },
        {
          type: "paragraph",
          text: "PostSiva — Billing Department. Response hours: Monday–Friday, 9:00 AM – 6:00 PM (UTC). We aim to respond to all refund inquiries within 5 business days.",
        },
      ],
    },
  ],
  footer:
    "© 2026 PostSiva. All rights reserved. This Refund Policy may be updated from time to time. Material changes will be posted on this page with an updated effective date.",
};
