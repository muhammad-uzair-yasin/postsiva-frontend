/**
 * Admin outreach email templates for the Users management page.
 * Pure data + helpers — tested in tests/admin-email-templates.test.mjs.
 */

export type EmailTemplateCategory =
  | "onboarding"
  | "engagement"
  | "payment"
  | "feature"
  | "reengagement"
  | "support"
  | "upgrade"
  | "milestone"
  | "feedback";

export interface AdminEmailTemplate {
  id: string;
  category: EmailTemplateCategory;
  name: string;
  subject: string;
  body: string;
}

export const EMAIL_TEMPLATE_CATEGORIES: {
  id: EmailTemplateCategory;
  label: string;
}[] = [
  { id: "onboarding", label: "Onboarding" },
  { id: "engagement", label: "Engagement" },
  { id: "payment", label: "Payments & billing" },
  { id: "feature", label: "Feature adoption" },
  { id: "reengagement", label: "Re-engagement" },
  { id: "support", label: "Support" },
  { id: "upgrade", label: "Upgrade & upsell" },
  { id: "milestone", label: "Milestones" },
  { id: "feedback", label: "Feedback" },
];

/** 55 ready-to-send templates grouped by occasion. */
export const ADMIN_EMAIL_TEMPLATES: AdminEmailTemplate[] = [
  // Onboarding (6)
  {
    id: "welcome-day1",
    category: "onboarding",
    name: "Welcome — day 1",
    subject: "Welcome to Postsiva — let's get your first post live",
    body: "Thanks for joining Postsiva! Connect one social account today and schedule your first post — most users publish within 24 hours.",
  },
  {
    id: "welcome-connect",
    category: "onboarding",
    name: "Connect your first account",
    subject: "Quick start: connect a social account in 2 minutes",
    body: "You're one connection away from scheduling across LinkedIn, Instagram, Facebook, and more. Open Settings → Connect your world and pick your first platform.",
  },
  {
    id: "welcome-workspace",
    category: "onboarding",
    name: "Set up your workspace",
    subject: "Your Postsiva workspace is ready",
    body: "Invite teammates or keep it solo — either way, your workspace keeps channels, drafts, and the calendar in one place. Need help? Reply and we'll walk you through it.",
  },
  {
    id: "welcome-first-draft",
    category: "onboarding",
    name: "Save your first draft",
    subject: "Try saving a draft — it takes 30 seconds",
    body: "Open the composer, write a caption, and hit Save draft. You can polish it later with AI or schedule when you're ready.",
  },
  {
    id: "welcome-calendar",
    category: "onboarding",
    name: "Explore the calendar",
    subject: "See your content calendar at a glance",
    body: "The calendar shows everything scheduled across platforms. Drag posts to reschedule and keep your week organized.",
  },
  {
    id: "welcome-persona",
    category: "onboarding",
    name: "Create an AI persona",
    subject: "Write faster with an AI persona",
    body: "Personas teach Postsiva your brand voice. Create one under Personas and use it in the composer or AI agent for on-brand captions.",
  },
  // Engagement (8)
  {
    id: "engage-inactive-7d",
    category: "engagement",
    name: "Inactive 7 days",
    subject: "We miss you on Postsiva",
    body: "It's been a week since your last visit. Your connected accounts and drafts are still here — log in anytime to pick up where you left off.",
  },
  {
    id: "engage-schedule-tip",
    category: "engagement",
    name: "Scheduling tip",
    subject: "Schedule a week of posts in one sitting",
    body: "Batch-create content, then use the calendar to spread posts across the week. Most teams save 3+ hours per week this way.",
  },
  {
    id: "engage-inbox",
    category: "engagement",
    name: "Try unified inbox",
    subject: "Reply to comments from one inbox",
    body: "Postsiva pulls comments from connected platforms into a single inbox. Try replying from Inbox — AI suggestions can speed things up.",
  },
  {
    id: "engage-analytics",
    category: "engagement",
    name: "Check analytics",
    subject: "See what's working across your channels",
    body: "Your dashboard aggregates performance so you can double down on what resonates. Open Home to review recent post stats.",
  },
  {
    id: "engage-agent",
    category: "engagement",
    name: "Meet Piva AI agent",
    subject: "Your AI social assistant is ready",
    body: "Ask Piva to draft posts, brainstorm ideas, or plan a campaign. Open the AI agent from the sidebar and try a quick prompt.",
  },
  {
    id: "engage-trends",
    category: "engagement",
    name: "Discover trends",
    subject: "Fresh content ideas from Trends",
    body: "Trends surfaces topics you can turn into posts in one click. Browse Trends and send an idea straight to the composer.",
  },
  {
    id: "engage-library",
    category: "engagement",
    name: "Organize media library",
    subject: "Keep assets in your media library",
    body: "Upload once, reuse everywhere. Your library works across drafts, scheduled posts, and the composer.",
  },
  {
    id: "engage-referral",
    category: "engagement",
    name: "Refer & earn",
    subject: "Earn rewards when friends subscribe",
    body: "Share your referral link from Refer & Earn. You earn cash when referrals upgrade — it's in your account settings.",
  },
  // Payment & billing (10)
  {
    id: "pay-trial-ending",
    category: "payment",
    name: "Trial ending soon",
    subject: "Your Postsiva trial ends soon",
    body: "Upgrade before your trial ends to keep scheduling, AI credits, and connected accounts without interruption. Visit Billing in account settings.",
  },
  {
    id: "pay-trial-ended",
    category: "payment",
    name: "Trial ended",
    subject: "Your trial has ended — pick a plan to continue",
    body: "We hope Postsiva helped you publish faster. Choose Starter or Pro under Billing to restore full access.",
  },
  {
    id: "pay-payment-failed",
    category: "payment",
    name: "Payment failed",
    subject: "Action needed: update your payment method",
    body: "We couldn't process your last payment. Update your card in Billing within 5 days to avoid losing scheduled posts and premium features.",
  },
  {
    id: "pay-past-due",
    category: "payment",
    name: "Past due reminder",
    subject: "Your Postsiva subscription is past due",
    body: "Your account is in a grace period. Fix billing today to keep publishing and AI usage on your current plan.",
  },
  {
    id: "pay-invoice-receipt",
    category: "payment",
    name: "Receipt available",
    subject: "Your Postsiva receipt is ready",
    body: "Thanks for your payment. You can view invoices and manage your subscription anytime under Account → Billing.",
  },
  {
    id: "pay-upgrade-thank-you",
    category: "payment",
    name: "Thank you for upgrading",
    subject: "Thanks for upgrading Postsiva",
    body: "Your plan is active with higher limits and AI credits. Explore Pro features like advanced scheduling and personas if you haven't already.",
  },
  {
    id: "pay-cancel-save",
    category: "payment",
    name: "Cancellation save offer",
    subject: "Before you go — can we help?",
    body: "We noticed you're thinking about leaving. Reply with what's missing and we'll suggest a plan or workflow fix — no pressure.",
  },
  {
    id: "pay-annual-discount",
    category: "payment",
    name: "Switch to annual billing",
    subject: "Save with annual billing on Postsiva",
    body: "Pay yearly and save versus monthly. Switch under Billing when you're ready — your remaining time is credited.",
  },
  {
    id: "pay-quota-near-limit",
    category: "payment",
    name: "Quota almost used",
    subject: "You're close to your plan limit",
    body: "You've used most of your monthly publish or AI quota. Upgrade or wait for the reset — check usage under Account → AI Usage.",
  },
  {
    id: "pay-refund-processed",
    category: "payment",
    name: "Refund processed",
    subject: "Your Postsiva refund has been processed",
    body: "We've issued your refund. It may take 5–10 business days to appear on your statement. Reach out if you need anything else.",
  },
  // Feature adoption (8)
  {
    id: "feat-scheduler",
    category: "feature",
    name: "Post scheduler",
    subject: "Schedule posts for the best times",
    body: "Pick a slot on the calendar or use Schedule in the composer. Postsiva publishes automatically — no manual posting.",
  },
  {
    id: "feat-ai-rephrase",
    category: "feature",
    name: "AI rephrase",
    subject: "Polish captions with AI rephrase",
    body: "Highlight text in the composer and use Rephrase to match your tone or shorten for character limits.",
  },
  {
    id: "feat-carousel",
    category: "feature",
    name: "Carousel posts",
    subject: "Publish carousels to LinkedIn and Instagram",
    body: "Add multiple images in the composer and select carousel where supported. Great for tutorials and product showcases.",
  },
  {
    id: "feat-wordpress",
    category: "feature",
    name: "WordPress blogs",
    subject: "Cross-post to WordPress from Postsiva",
    body: "Connect WordPress.com sites and publish articles alongside social posts from one workspace.",
  },
  {
    id: "feat-mcp",
    category: "feature",
    name: "MCP / ChatGPT actions",
    subject: "Control Postsiva from ChatGPT",
    body: "Connect MCP under Settings to draft and schedule from ChatGPT or Claude. Handy for quick updates on the go.",
  },
  {
    id: "feat-watcher",
    category: "feature",
    name: "AI comment watcher",
    subject: "Let AI watch and reply to comments",
    body: "AI Watcher can suggest or post replies on supported platforms. Turn it on under Published → AI Watcher.",
  },
  {
    id: "feat-rss",
    category: "feature",
    name: "RSS feeds",
    subject: "Turn RSS into social posts",
    body: "Add RSS feeds in your workspace to discover articles and spin them into posts with one click.",
  },
  {
    id: "feat-canva",
    category: "feature",
    name: "Canva integration",
    subject: "Design in Canva, publish with Postsiva",
    body: "Connect Canva to import designs straight into the composer without downloading files.",
  },
  // Re-engagement (8)
  {
    id: "re-30d-inactive",
    category: "reengagement",
    name: "Inactive 30 days",
    subject: "Your Postsiva account is waiting for you",
    body: "It's been a while! Log in to see scheduled posts, reconnect accounts if needed, and publish again in minutes.",
  },
  {
    id: "re-draft-reminder",
    category: "reengagement",
    name: "Unpublished drafts",
    subject: "You have drafts ready to publish",
    body: "Finish and schedule drafts from the Drafts tab — or ask Piva to tighten the copy before you go live.",
  },
  {
    id: "re-expired-token",
    category: "reengagement",
    name: "Reconnect social account",
    subject: "Reconnect a social account on Postsiva",
    body: "One of your connections may need re-authorization. Open Connect your world and refresh any account showing disconnected.",
  },
  {
    id: "re-winback-offer",
    category: "reengagement",
    name: "Win-back check-in",
    subject: "Can we win you back to Postsiva?",
    body: "We'd love another chance to help you grow on social. Reply with what went wrong — product, pricing, or support — and we'll make it right.",
  },
  {
    id: "re-seasonal-q1",
    category: "reengagement",
    name: "New year planning",
    subject: "Plan your Q1 content on Postsiva",
    body: "Start the quarter with a content calendar. Batch ideas in Trends, schedule in the calendar, and stay consistent.",
  },
  {
    id: "re-holiday-pause",
    category: "reengagement",
    name: "Back from holiday break",
    subject: "Welcome back — resume posting on Postsiva",
    body: "Hope you had a good break. Your workspace is unchanged — review the calendar and queue posts for the week ahead.",
  },
  {
    id: "re-abandoned-cart",
    category: "reengagement",
    name: "Incomplete checkout",
    subject: "Finish upgrading Postsiva",
    body: "You started checkout but didn't finish. Your cart is saved — complete billing anytime to unlock Pro features.",
  },
  {
    id: "re-churn-survey",
    category: "reengagement",
    name: "Churn survey",
    subject: "Quick question about your Postsiva experience",
    body: "We're improving Postsiva based on honest feedback. What would have kept you active? One sentence is enough — reply to this email.",
  },
  // Support (6)
  {
    id: "sup-ticket-received",
    category: "support",
    name: "Support ticket received",
    subject: "We received your Postsiva support request",
    body: "Our team is reviewing your message and will reply within one business day. Include screenshots if the issue is UI-related.",
  },
  {
    id: "sup-bug-followup",
    category: "support",
    name: "Bug fix follow-up",
    subject: "We fixed an issue you reported",
    body: "A fix for the problem you reported is live. Please try again and let us know if anything still looks off.",
  },
  {
    id: "sup-how-to-publish",
    category: "support",
    name: "How to publish",
    subject: "How to publish a post on Postsiva",
    body: "Connect an account → open Composer → add media and caption → Post now or Schedule. Help Center has step-by-step guides for each platform.",
  },
  {
    id: "sup-password-reset",
    category: "support",
    name: "Password help",
    subject: "Reset your Postsiva password",
    body: "Use Forgot password on the login page. If you signed up with Google, continue with Google instead — no password needed.",
  },
  {
    id: "sup-billing-question",
    category: "support",
    name: "Billing question",
    subject: "Questions about your Postsiva bill?",
    body: "Reply with your account email and we'll explain charges, invoices, or plan changes. You can also manage payment methods under Billing.",
  },
  {
    id: "sup-escalation",
    category: "support",
    name: "Priority support",
    subject: "Your Postsiva case is being prioritized",
    body: "We've escalated your request to a senior teammate. Expect an update within 24 hours.",
  },
  // Upgrade & upsell (6)
  {
    id: "up-free-to-starter",
    category: "upgrade",
    name: "Free → Starter",
    subject: "Unlock more posts with Starter",
    body: "Starter adds higher publish limits and AI credits for growing creators. Compare plans on the Pricing page or under Billing.",
  },
  {
    id: "up-starter-to-pro",
    category: "upgrade",
    name: "Starter → Pro",
    subject: "Go Pro for teams and advanced AI",
    body: "Pro includes more workspaces, personas, and AI usage — built for agencies and power users. Upgrade anytime from Billing.",
  },
  {
    id: "up-ai-credits",
    category: "upgrade",
    name: "Need more AI credits",
    subject: "Running low on AI credits?",
    body: "Upgrade your plan or wait for the monthly reset. Pro users get significantly more AI for content and image generation.",
  },
  {
    id: "up-workspaces",
    category: "upgrade",
    name: "Multiple workspaces",
    subject: "Manage clients with separate workspaces",
    body: "Each workspace has its own channels and calendar. Pro supports more workspaces — ideal for agencies managing multiple brands.",
  },
  {
    id: "up-team-seats",
    category: "upgrade",
    name: "Invite teammates",
    subject: "Collaborate with your team on Postsiva",
    body: "Invite members to a workspace from Workspaces → Members. Everyone shares connections and the content calendar.",
  },
  {
    id: "up-enterprise",
    category: "upgrade",
    name: "Enterprise inquiry",
    subject: "Postsiva for larger teams",
    body: "Need custom limits, SSO, or invoicing? Reply with your team size and we'll share enterprise options.",
  },
  // Milestones (6)
  {
    id: "mile-first-post",
    category: "milestone",
    name: "First post published",
    subject: "Congrats on your first Postsiva publish!",
    body: "You published through Postsiva — nice work! Keep the momentum with a weekly schedule on the calendar.",
  },
  {
    id: "mile-10-posts",
    category: "milestone",
    name: "10 posts published",
    subject: "You've published 10 posts with Postsiva",
    body: "Consistency pays off. Review analytics to see which posts performed best and plan more like them.",
  },
  {
    id: "mile-100-posts",
    category: "milestone",
    name: "100 posts published",
    subject: "100 posts — you're a Postsiva power user",
    body: "That's a serious publishing streak. Thank you for building with us — reply if you'd like to share your story.",
  },
  {
    id: "mile-1yr",
    category: "milestone",
    name: "1 year on Postsiva",
    subject: "Happy Postsiva anniversary!",
    body: "You've been with us for a year. We appreciate you — here's to many more scheduled posts and less manual work.",
  },
  {
    id: "mile-connected-5",
    category: "milestone",
    name: "5 platforms connected",
    subject: "You're publishing across 5 platforms",
    body: "Multi-platform presence unlocked. Use unified analytics to compare channels and refine your mix.",
  },
  {
    id: "mile-referral-paid",
    category: "milestone",
    name: "Referral converted",
    subject: "Your referral just subscribed — thank you!",
    body: "Your referral reward is credited to your wallet. Check Refer & Earn for balance and withdrawal options.",
  },
  // Feedback (5)
  {
    id: "fb-general",
    category: "feedback",
    name: "General feedback request",
    subject: "We'd love your feedback on Postsiva",
    body: "What's working well? What's frustrating? Reply with honest feedback — we read every message.",
  },
  {
    id: "fb-nps",
    category: "feedback",
    name: "NPS survey",
    subject: "How likely are you to recommend Postsiva?",
    body: "Rate us 0–10 in a reply and tell us why. Your score helps us prioritize improvements.",
  },
  {
    id: "fb-feature-request",
    category: "feedback",
    name: "Feature request",
    subject: "What should we build next?",
    body: "Tell us the one feature that would make Postsiva indispensable for you. We track every suggestion.",
  },
  {
    id: "fb-beta-invite",
    category: "feedback",
    name: "Beta feature invite",
    subject: "You're invited to try a new Postsiva feature",
    body: "We're testing something new with a small group. Reply if you'd like early access and we'll send details.",
  },
  {
    id: "fb-thank-review",
    category: "feedback",
    name: "Thank you + review ask",
    subject: "Thanks for being a Postsiva customer",
    body: "If Postsiva saves you time, a short review on G2 or Product Hunt helps other creators find us. Either way, thank you.",
  },
];

export function getEmailTemplateById(id: string): AdminEmailTemplate | undefined {
  return ADMIN_EMAIL_TEMPLATES.find((t) => t.id === id);
}

export function filterEmailTemplates(
  category: EmailTemplateCategory | "all",
  query: string,
): AdminEmailTemplate[] {
  const needle = query.trim().toLowerCase();
  return ADMIN_EMAIL_TEMPLATES.filter((t) => {
    if (category !== "all" && t.category !== category) return false;
    if (!needle) return true;
    return (
      t.name.toLowerCase().includes(needle) ||
      t.subject.toLowerCase().includes(needle) ||
      t.body.toLowerCase().includes(needle) ||
      t.id.toLowerCase().includes(needle)
    );
  });
}
