import type { HelpArticle, HelpCategory } from "@/lib/help/helpTypes";

export const HELP_CATEGORIES: readonly HelpCategory[] = [
  {
    slug: "getting-started",
    title: "Getting started",
    description: "First steps for new workspaces, quick setup, and the fastest route to shipping your first post.",
    icon: "rocket_launch",
  },
  {
    slug: "social-accounts",
    title: "Connecting social accounts",
    description: "OAuth setup, permissions, and what each network needs before Postsiva can publish for you.",
    icon: "hub",
  },
  {
    slug: "scheduling-publishing",
    title: "Scheduling and publishing",
    description: "Create, queue, schedule, and ship content confidently across the networks you manage.",
    icon: "event_available",
  },
  {
    slug: "managing-posts",
    title: "Managing posts",
    description: "Draft hygiene, editing, previews, approvals, and keeping your publishing pipeline organized.",
    icon: "edit_note",
  },
  {
    slug: "media-canva",
    title: "Media and Canva",
    description: "Bring in visuals from Canva and cloud storage without slowing down your content workflow.",
    icon: "perm_media",
  },
  {
    slug: "ai-automation",
    title: "AI and automations",
    description: "Use Postsiva GPT, MCP, and automation surfaces safely inside your workspace workflow.",
    icon: "smart_toy",
  },
  {
    slug: "workspaces-team",
    title: "Workspaces and team",
    description: "Organize brands, clients, permissions, and switching context without losing control.",
    icon: "groups",
  },
  {
    slug: "billing-plans",
    title: "Billing and plans",
    description: "Understand plans, limits, billing cycles, and what changes as your team grows.",
    icon: "credit_card",
  },
  {
    slug: "troubleshooting",
    title: "Troubleshooting",
    description: "Fix the most common connection, publishing, and workspace issues before they block launches.",
    icon: "construction",
  },
  {
    slug: "wordpress",
    title: "WordPress",
    description: "Connect self-hosted WordPress sites and understand the difference between WordPress.com and self-hosted setups.",
    icon: "language",
  },
] as const;

export const HELP_ARTICLES: readonly HelpArticle[] = [
  {
    slug: "create-account-login-and-verify-email",
    categorySlug: "getting-started",
    title: "Create an account, sign in, and verify your email",
    summary:
      "Sign up, log in, enter your 6-digit verification code, and check spam if the email does not arrive.",
    keywords: [
      "signup",
      "sign up",
      "login",
      "sign in",
      "verify",
      "otp",
      "email code",
      "spam",
      "create account",
    ],
    featured: true,
    readTime: "5 min",
    updatedAt: "2026-08-06",
    body: [
      {
        title: "What this guide covers",
        paragraphs: [
          "New Postsiva users usually follow three screens: Create account → Sign in → Verify your email. This guide walks through each step and what to do if the verification code is missing.",
        ],
      },
      {
        title: "1. Sign up (Create account)",
        paragraphs: [
          "Open Sign up and create your Postsiva account with email, or continue with a supported social option such as Facebook or TikTok.",
        ],
        steps: [
          {
            title: "Open Create account",
            body: "Go to Sign up from the marketing site or the “Create an account” link on the login page.",
          },
          {
            title: "Enter your details",
            body: "Add your first name, email, and password. Workspace name is optional at signup — you can finish workspace setup afterward.",
          },
          {
            title: "Agree and create",
            body: "Accept the Terms of Service and Privacy Policy, then select Create account.",
          },
        ],
        imageKey: "auth-signup",
        imageAlt: "Postsiva Create account screen with social signup and email fields",
        note: "After signup, Postsiva may ask you to verify your email before you can use the full workspace.",
      },
      {
        title: "2. Log in (Sign in)",
        paragraphs: [
          "If you already have an account, use Sign in. You can continue with Google, LinkedIn, Microsoft, Facebook, TikTok, or email and password.",
        ],
        steps: [
          {
            title: "Open Sign in",
            body: "Go to the login page and choose a social provider or enter the email and password you used at signup.",
          },
          {
            title: "Forgot password",
            body: "Use Forgot Password? if you cannot remember your password. Complete that flow, then return to Sign in.",
          },
        ],
        imageKey: "auth-login",
        imageAlt: "Postsiva Sign in screen with social login options and email fields",
      },
      {
        title: "3. Verify your email (6-digit code)",
        paragraphs: [
          "Postsiva emails a 6-digit code to confirm the address belongs to you. Enter the code on the Verify your email screen. Codes typically expire in about 10 minutes.",
        ],
        steps: [
          {
            title: "Open your inbox",
            body: "Look for an email from Postsiva with the verification code. Use the same address you entered at signup or login.",
          },
          {
            title: "Enter the code",
            body: "Type the 6 digits into the boxes on the Verify your email screen, then select Verify email.",
          },
          {
            title: "Resend if needed",
            body: "If nothing arrives, use Resend code on the verify screen, wait a minute, and check again.",
          },
        ],
        imageKey: "auth-verify",
        imageAlt: "Postsiva Verify your email screen with six-digit code inputs",
      },
      {
        title: "Check spam / junk if you do not get the code",
        paragraphs: [
          "Verification emails sometimes land in Spam, Junk, Promotions, or Updates instead of Primary.",
        ],
        bullets: [
          "Search your mailbox for “Postsiva” or “verification”.",
          "Open Spam / Junk and mark the Postsiva message as Not spam so future codes arrive in your inbox.",
          "Confirm you typed the correct email on signup or login.",
          "Wait a minute, then use Resend code and check spam again.",
          "If your company filters mail, ask IT to allow Postsiva emails, or try a personal inbox.",
        ],
        note: "Still stuck after checking spam and resending? Contact support from the Help Center and include the email address you used.",
      },
    ],
  },
  {
    slug: "start-your-first-workspace",
    categorySlug: "getting-started",
    title: "Start your first Postsiva workspace",
    summary:
      "Open the workspace menu, create a new workspace, name it, and get your first publishing cockpit ready.",
    keywords: [
      "workspace",
      "getting started",
      "brand",
      "new account",
      "create workspace",
    ],
    featured: true,
    readTime: "5 min",
    updatedAt: "2026-08-06",
    body: [
      {
        title: "What a workspace is",
        paragraphs: [
          "A workspace is the operational home for one brand, client, or team. It keeps connected channels, drafts, inbox activity, calendars, and permissions scoped together.",
          "If you manage multiple brands, create a separate workspace for each one instead of mixing everything into a single publishing surface.",
        ],
      },
      {
        title: "1. Open the workspace selector",
        paragraphs: [
          "In the app header (top right), open the workspace menu next to your profile. That control shows your current workspace name.",
        ],
        imageKey: "workspace-selector",
        imageAlt:
          "Postsiva dashboard with the workspace selector highlighted in the top-right header",
      },
      {
        title: "2. Choose Create workspace",
        paragraphs: [
          "In the Workspaces menu, review your current workspace, then select + Create workspace at the bottom of the list.",
        ],
        imageKey: "workspace-create-menu",
        imageAlt:
          "Workspace dropdown open with the Create workspace action highlighted",
      },
      {
        title: "3. Name and create the workspace",
        paragraphs: [
          "In the New workspace dialog, enter a clear name (brand or client name works best), then select Create.",
        ],
        steps: [
          {
            title: "Enter the workspace name",
            body: "Use a name your team will recognize in the header and settings — for example the brand or client name.",
          },
          {
            title: "Select Create",
            body: "Confirm with Create. Postsiva switches you into the new workspace when it is ready.",
          },
        ],
        imageKey: "workspace-new-modal",
        imageAlt: "New workspace modal with workspace name field and Create button",
      },
      {
        title: "After you create it",
        steps: [
          {
            title: "Connect one social channel first",
            body: "Start with the network you publish to most often so you can test the workflow end to end quickly.",
          },
          {
            title: "Review plan limits",
            body: "Confirm channel, workspace, and collaborator limits before inviting teammates or connecting every account at once.",
          },
          {
            title: "Publish a test post",
            body: "Create a low-risk draft, preview it, and schedule it so you confirm time zone and publishing flow early.",
          },
        ],
        bullets: [
          "Use one workspace per brand, not per person.",
          "Confirm the active workspace in the header before publishing.",
          "Connect channels gradually so permission issues are easier to isolate.",
        ],
      },
    ],
  },
  {
    slug: "use-the-unified-dashboard",
    categorySlug: "getting-started",
    title: "Use the unified dashboard",
    summary:
      "Open Dashboard to see connected channels in one place, switch accounts, and review posts, comments, reach, likes, and engagement.",
    keywords: [
      "dashboard",
      "unified dashboard",
      "analytics",
      "engagement",
      "social accounts",
      "all platforms",
    ],
    featured: true,
    readTime: "4 min",
    updatedAt: "2026-08-06",
    body: [
      {
        title: "One dashboard for every channel",
        paragraphs: [
          "Dashboard is the home view for your workspace. The social accounts column lists All platforms and each connected channel. Select a channel to see profile details and unified analytics for that account.",
        ],
        imageKey: "unified-dashboard",
        imageAlt:
          "Postsiva Dashboard with social channels list, Active LinkedIn profile, and posts comments reach likes engagement",
      },
      {
        title: "What you can do here",
        bullets: [
          "Switch channels — pick All platforms or a single LinkedIn, Instagram, YouTube, and other connected accounts.",
          "Confirm Active status — see the profile, Visit Profile, and org/connection stats when available.",
          "Read analytics — Post, Comments, Reach, Likes, and Engagement rate from unified analytics for the selected platform.",
          "Jump to Create — use + Create anytime to open the unified composer.",
        ],
        note: "Analytics and some nav items depend on your plan. Free may show upgrade prompts instead of full metrics — see Billing and plans.",
      },
    ],
  },
  {
    slug: "connect-instagram-account",
    categorySlug: "social-accounts",
    title: "Connect an Instagram account",
    summary:
      "Open Connect account, link Instagram, allow permissions, and convert a personal account to Creator or Business when Instagram asks.",
    keywords: [
      "instagram",
      "oauth",
      "connect account",
      "meta",
      "permissions",
      "creator",
      "business",
      "professional",
      "personal account",
    ],
    featured: true,
    readTime: "8 min",
    updatedAt: "2026-08-06",
    body: [
      {
        title: "Before you begin",
        bullets: [
          "Connect from the workspace that should own this Instagram channel.",
          "Use the Instagram login that owns the profile you want to publish from.",
          "Postsiva needs a professional Instagram account (Creator or Business). Personal accounts must convert during the connect flow.",
        ],
      },
      {
        title: "1. Open Connect account",
        paragraphs: [
          "On the dashboard, use Connect account (or open Social accounts → Add more platforms) to start linking channels.",
        ],
        imageKey: "ig-dashboard-connect",
        imageAlt:
          "Postsiva dashboard with Connect account banner to link the first social account",
      },
      {
        title: "2. Open Connect your world",
        paragraphs: [
          "The Connect your world modal lists every platform you can link. Status shows how many accounts are connected.",
        ],
        imageKey: "ig-connect-world",
        imageAlt: "Connect your world modal listing Instagram and other platforms",
      },
      {
        title: "3. Click Connect on Instagram",
        paragraphs: [
          "Find the Instagram card and select Connect to start the secure Instagram / Meta sign-in window.",
        ],
        imageKey: "ig-click-connect",
        imageAlt: "Connect your world modal with Connect highlighted on the Instagram card",
      },
      {
        title: "4. Wait for the secure connection window",
        paragraphs: [
          "Postsiva opens a provider window while Instagram shows Connecting…. Keep that window open until sign-in finishes.",
        ],
        imageKey: "ig-secure-connection",
        imageAlt: "Preparing secure connection popup while Instagram shows Connecting",
      },
      {
        title: "5. Log in to Instagram",
        paragraphs: [
          "Sign in with the Instagram username or email for the account you want to connect, then continue.",
        ],
        imageKey: "ig-login",
        imageAlt: "Instagram login popup opened from Postsiva connect flow",
      },
      {
        title: "If Instagram says your account is personal",
        paragraphs: [
          "Instagram may ask you to change to a professional account before Postsiva can connect. Choose Change to continue.",
        ],
        steps: [
          {
            title: "Change to professional account",
            body: "When you see “Change to professional account?”, select Change. Postsiva cannot finish Instagram connect on a personal profile.",
          },
          {
            title: "Pick Creator or Business",
            body: "Choose Creator (public figures, creators, influencers) or Business (brands, shops, local businesses). Either type works with Postsiva.",
          },
          {
            title: "Choose a category",
            body: "Pick the category that best describes you, then select Done. You can hide the category on your profile if you prefer.",
          },
          {
            title: "Confirm it is ready",
            body: "When Instagram shows that your business or creator account is ready, continue so Postsiva can request permissions.",
          },
        ],
        imageKey: "ig-change-professional",
        imageAlt: "Instagram prompt to change a personal account to a professional account",
        note: "You can also convert in the Instagram app later: Settings → Account type and tools → Switch to professional account — then reconnect in Postsiva.",
      },
      {
        title: "Creator or Business selection",
        paragraphs: [
          "On “Which best describes you?”, select Creator or Business, then continue.",
        ],
        imageKey: "ig-creator-or-business",
        imageAlt: "Instagram screen to choose Creator or Business professional account type",
      },
      {
        title: "Choose your category",
        paragraphs: [
          "Search or pick a suggested category, then select Done.",
        ],
        imageKey: "ig-choose-category",
        imageAlt: "Instagram professional account category selection screen",
      },
      {
        title: "Professional account ready",
        paragraphs: [
          "Instagram confirms your business or creator account is ready. Continue so you can allow Postsiva access.",
        ],
        imageKey: "ig-business-ready",
        imageAlt: "Instagram confirmation that the business account is ready",
      },
      {
        title: "6. Allow Instagram permissions",
        paragraphs: [
          "Postsiva-IG asks for access such as profile and media (required), publishing content, comments, messages, and insights. Leave required items on, review optional toggles, then select Allow.",
        ],
        imageKey: "ig-permissions",
        imageAlt: "Instagram permissions screen for Postiva-IG with Allow and Cancel",
        note: "If you cancel or deny required permissions, Instagram will not stay connected. Start Connect again and select Allow.",
      },
      {
        title: "7. Confirm Instagram is connected",
        paragraphs: [
          "Back in Connect your world, Instagram should show Connected. On Social accounts you should see the handle as Active.",
        ],
        imageKey: "ig-connected-modal",
        imageAlt: "Connect your world modal showing Instagram as Connected",
      },
      {
        title: "Success in Social accounts",
        paragraphs: [
          "Open Social accounts in the workspace sidebar to see the connected Instagram profile, Active status, and options to add more platforms.",
        ],
        imageKey: "ig-social-accounts",
        imageAlt: "Postsiva Social accounts page with a connected Instagram profile Active",
      },
      {
        title: "If connect fails",
        bullets: [
          "Confirm the account is Creator or Business, not Personal.",
          "Use the Instagram login that owns the profile.",
          "Allow required permissions on the consent screen.",
          "Check whether the same Instagram is already connected in another workspace.",
          "Close stuck popups, then try Connect again.",
        ],
      },
    ],
  },
  {
    slug: "connect-linkedin-account",
    categorySlug: "social-accounts",
    title: "Connect a LinkedIn account",
    summary:
      "Open Connect your world, sign in to LinkedIn, allow Postsiva permissions, and confirm the account shows Connected.",
    keywords: ["linkedin", "oauth", "organization", "page", "authorize", "connect"],
    featured: true,
    readTime: "5 min",
    updatedAt: "2026-08-06",
    body: [
      {
        title: "Before you begin",
        bullets: [
          "Connect from the workspace that should own LinkedIn drafts, posts, and analytics.",
          "Use the LinkedIn login that owns the profile or has admin access to the organization page you want to publish to.",
        ],
      },
      {
        title: "1. Open Connect your world and start LinkedIn",
        paragraphs: [
          "In Social accounts (or Connect account on the dashboard), open Connect your world and select Connect on the LinkedIn card.",
        ],
      },
      {
        title: "2. Sign in to LinkedIn",
        paragraphs: [
          "Postsiva opens a LinkedIn sign-in window. Enter the email or phone for the account you want to connect, then select Sign in.",
        ],
        imageKey: "li-login",
        imageAlt: "LinkedIn sign-in popup opened from Postsiva Connect your world",
        note: "Keep the popup open until LinkedIn finishes. Closing it early cancels the connection.",
      },
      {
        title: "3. Allow Postsiva access",
        paragraphs: [
          "On the LinkedIn Authorize screen, review what postsiva-analytics would like to do (profile, posts, analytics, and organization permissions as listed), then select Allow.",
        ],
        imageKey: "li-authorize",
        imageAlt: "LinkedIn Authorize screen listing Postsiva permissions with Allow",
        note: "You will be redirected to backend.postsiva.com to finish linking. If you select Cancel, LinkedIn will not stay connected.",
      },
      {
        title: "4. Confirm LinkedIn is connected",
        paragraphs: [
          "Back in Connect your world, LinkedIn should show Connected with Disconnect available. Status counts update (for example 2 connected).",
        ],
        imageKey: "li-connected",
        imageAlt: "Connect your world modal showing LinkedIn as Connected",
      },
      {
        title: "If connect fails",
        bullets: [
          "Sign in with the LinkedIn identity that has posting rights for the profile or page.",
          "Select Allow on the consent screen — required permissions must stay granted.",
          "Confirm you started Connect from the correct workspace.",
          "Close stuck popups, then try Connect on LinkedIn again.",
        ],
      },
    ],
  },
  {
    slug: "connect-facebook-account",
    categorySlug: "social-accounts",
    title: "Connect a Facebook page",
    summary:
      "Start Facebook connect from Connect your world, review Facebook Login for Business access, save page permissions, and confirm Connected.",
    keywords: ["facebook", "page", "meta", "oauth", "login for business"],
    featured: false,
    readTime: "5 min",
    updatedAt: "2026-08-06",
    body: [
      {
        title: "Before you begin",
        bullets: [
          "Connect from the workspace where the Facebook page should live.",
          "Use the Meta identity that has page admin rights for publishing.",
          "Know which Page you want if you manage more than one.",
        ],
      },
      {
        title: "1. Start Facebook connect",
        paragraphs: [
          "Open Connect your world and select Connect on Facebook. The card shows Connecting… while the Facebook Login for Business window opens.",
        ],
      },
      {
        title: "2. Review access and save",
        paragraphs: [
          "On Review access, confirm the Page selected and the permissions Postsiva_posts needs (create content, manage comments, read Page content, and list Pages you manage). Select Save to continue.",
        ],
        imageKey: "fb-business-login",
        imageAlt: "Facebook Login for Business review access request for Postsiva_posts",
        note: "If the wrong Page is selected, go Back and choose the correct Page before saving.",
      },
      {
        title: "3. Confirm Facebook is connected",
        paragraphs: [
          "When the popup closes, Facebook should show Connected in Connect your world. Open Social accounts anytime to disconnect or add more platforms.",
        ],
      },
      {
        title: "What usually goes wrong",
        bullets: [
          "Logging into the wrong Meta identity.",
          "Having profile access but not page publishing rights.",
          "Selecting the wrong page when several businesses are attached.",
        ],
      },
    ],
  },
  {
    slug: "connect-tiktok-account",
    categorySlug: "social-accounts",
    title: "Connect a TikTok account",
    summary: "Authorize TikTok publishing and make sure the connected account lands in the correct workspace.",
    keywords: ["tiktok", "short video", "connect", "oauth"],
    featured: false,
    readTime: "4 min",
    updatedAt: "2026-08-06",
    body: [
      {
        title: "Before connecting TikTok",
        paragraphs: [
          "TikTok flows are stricter about the identity you use and the account you approve. Connect only from the workspace that should own the resulting content calendar.",
        ],
      },
      {
        title: "Connection checklist",
        bullets: [
          "Use the exact TikTok login tied to the publishing account.",
          "Complete the consent flow without switching tabs midway.",
          "Preview a vertical post after connecting to verify the account landed correctly.",
        ],
      },
    ],
  },
  {
    slug: "connect-youtube-channel",
    categorySlug: "social-accounts",
    title: "Connect a YouTube channel",
    summary:
      "Choose the Google account that owns your channel, grant YouTube permissions, and confirm the channel is Connected in Postsiva.",
    keywords: ["youtube", "google", "channel", "connect", "oauth", "permissions"],
    featured: false,
    readTime: "5 min",
    updatedAt: "2026-08-06",
    body: [
      {
        title: "Before you begin",
        bullets: [
          "Start from the workspace that should own the YouTube channel.",
          "Use the Google account that owns or manages the channel you want to publish to.",
          "If several Google sessions are open, pick the right one before continuing.",
        ],
      },
      {
        title: "1. Start YouTube connect",
        paragraphs: [
          "In Connect your world, select Connect on YouTube. The card shows Connecting… while Google sign-in opens.",
        ],
      },
      {
        title: "2. Choose a Google account",
        paragraphs: [
          "Select the Google account that should continue to Postsiva (or Use another account if the listed one is wrong).",
        ],
        imageKey: "yt-google-account",
        imageAlt: "Google account picker to continue to Postsiva for YouTube connect",
      },
      {
        title: "3. Grant YouTube access",
        paragraphs: [
          "Review what Postsiva wants access to on your Google Account (manage videos, view the account, and related YouTube permissions), then select Continue.",
        ],
        imageKey: "yt-permissions",
        imageAlt: "Google OAuth screen listing YouTube permissions requested by Postsiva",
        note: "Selecting Cancel stops the connection. You can connect another channel later from the YouTube card.",
      },
      {
        title: "4. Confirm the channel",
        paragraphs: [
          "When OAuth finishes, YouTube should show Connected. Use Connect another channel if you manage more than one destination in this workspace.",
        ],
      },
    ],
  },
  {
    slug: "connect-threads-and-pinterest",
    categorySlug: "social-accounts",
    title: "Connect Threads and Pinterest accounts",
    summary:
      "Authorize Pinterest or Threads from Connect your world, review access, and confirm each network shows Connected.",
    keywords: ["threads", "pinterest", "connect account", "oauth", "give access"],
    featured: false,
    readTime: "6 min",
    updatedAt: "2026-08-06",
    body: [
      {
        title: "Connect one network at a time",
        paragraphs: [
          "Threads and Pinterest sit beside your other social accounts. Connect one, verify Connected, then start the other so workspace mapping stays clear.",
        ],
      },
      {
        title: "Pinterest: authorize the app",
        paragraphs: [
          "Select Connect on Pinterest. On Authorise app, review what postiva would like to do (boards, Pins, and account access), then select Give access.",
        ],
        imageKey: "pin-authorize",
        imageAlt: "Pinterest Authorise app screen with Give access for Postsiva",
      },
      {
        title: "Threads: continue as your profile",
        paragraphs: [
          "Select Connect on Threads. Review the access postsiva is requesting, then select Continue as your Threads profile.",
        ],
        imageKey: "th-authorize",
        imageAlt: "Threads authorization popup requesting access for postsiva",
      },
      {
        title: "Threads: edit optional access",
        paragraphs: [
          "If you open Edit requested access, keep required profile access on. Turn on optional items you need (create posts, manage replies, insights), then continue.",
        ],
        imageKey: "th-edit-access",
        imageAlt: "Threads Edit requested access toggles for Postsiva permissions",
        note: "Denying create/share access means Postsiva cannot publish to Threads even if the account appears connected.",
      },
      {
        title: "Confirm both are connected",
        bullets: [
          "Pinterest and Threads should each show Connected in Connect your world.",
          "Open Social accounts to see Active status and disconnect if needed.",
          "Reconnect from the correct workspace if an account lands in the wrong place.",
        ],
      },
    ],
  },
  {
    slug: "connect-bluesky-account",
    categorySlug: "social-accounts",
    title: "Connect a Bluesky account",
    summary:
      "Open Bluesky connect, enter your handle and an app password (not your account password), then connect safely.",
    keywords: ["bluesky", "app password", "atproto", "handle", "connect"],
    featured: false,
    readTime: "4 min",
    updatedAt: "2026-08-06",
    body: [
      {
        title: "Use an app password",
        paragraphs: [
          "Bluesky connects with an app password so you do not share your main account password. Generate one in Bluesky settings before you continue.",
        ],
      },
      {
        title: "1. Open Bluesky connect",
        paragraphs: [
          "In Connect your world, select Connect on Bluesky. The Bluesky App Password dialog opens.",
        ],
      },
      {
        title: "2. Enter handle and app password",
        paragraphs: [
          "Enter your Bluesky handle, paste the app password, then select Connect. Use Generate app password in Bluesky if you still need to create one.",
        ],
        imageKey: "bsky-app-password",
        imageAlt: "Postsiva Bluesky App Password dialog with handle and app password fields",
        note: "This is not your Bluesky account password. If connect fails, revoke the old app password and generate a new one.",
      },
      {
        title: "3. Confirm Bluesky is connected",
        paragraphs: [
          "When the dialog closes, Bluesky should show Connected. You can Disconnect anytime from the same card.",
        ],
      },
    ],
  },
  {
    slug: "connect-mastodon-account",
    categorySlug: "social-accounts",
    title: "Connect a Mastodon account",
    summary:
      "Enter your Mastodon instance, continue to Mastodon OAuth, and attach the account to the correct workspace.",
    keywords: ["mastodon", "instance", "oauth", "federated", "mastodon.social"],
    featured: false,
    readTime: "4 min",
    updatedAt: "2026-08-06",
    body: [
      {
        title: "Know your instance",
        paragraphs: [
          "Mastodon accounts live on a server (instance). Postsiva saves the instance for this workspace before opening Mastodon OAuth.",
        ],
      },
      {
        title: "1. Open Mastodon connect",
        paragraphs: [
          "In Connect your world, select Connect on Mastodon. The Mastodon Instance dialog opens.",
        ],
      },
      {
        title: "2. Enter or pick an instance",
        paragraphs: [
          "Type your server (for example mastodon.social) or choose a suggested instance, then select Connect to continue to Mastodon OAuth.",
        ],
        imageKey: "masto-instance",
        imageAlt: "Postsiva Mastodon Instance dialog with mastodon.social selected",
        note: "Use the exact instance where your account lives. A wrong server will fail OAuth or connect the wrong identity.",
      },
      {
        title: "3. Authorize and confirm",
        paragraphs: [
          "Complete Mastodon authorization in the popup. When you return, Mastodon should show Connected in Connect your world.",
        ],
      },
    ],
  },
  {
    slug: "schedule-your-first-post",
    categorySlug: "scheduling-publishing",
    title: "Schedule your first post",
    summary:
      "Compose in Create post, pick a time from the list or calendar, confirm the schedule bar, then Schedule.",
    keywords: [
      "schedule",
      "publish",
      "calendar",
      "queue",
      "pick a time",
      "create post",
    ],
    featured: true,
    readTime: "6 min",
    updatedAt: "2026-08-06",
    body: [
      {
        title: "Before you schedule",
        bullets: [
          "Connect at least one social channel in the active workspace.",
          "Confirm you are in the correct workspace before composing.",
          "Use Live preview to check text and media before you lock a time.",
        ],
      },
      {
        title: "1. Open Create post",
        paragraphs: [
          "Select Create (or Schedule Post from Calendar). Choose social channels, write the post body, and attach media. Keep Same for all unless you need per-platform copy.",
        ],
        imageKey: "sched-composer",
        imageAlt:
          "Create post composer with LinkedIn channel, post body, attached media, and live preview",
      },
      {
        title: "2. Open Pick a time",
        paragraphs: [
          "Select Schedule to open Pick a time. Use List for a day-by-day pipeline of slots, or switch to Calendar. Choose a quick slot such as + New 8:00 AM, or open Custom date & time.",
        ],
        imageKey: "sched-pick-time",
        imageAlt:
          "Pick a time modal in List view with Today, Tomorrow, and hourly New slots",
      },
      {
        title: "3. Choose a custom date & time (optional)",
        paragraphs: [
          "Custom date & time opens Choose date & time. Set the exact moment with the date and time controls, then select Continue to composer.",
        ],
        imageKey: "sched-choose-datetime",
        imageAlt:
          "Choose date & time dialog with date-time field and Continue to composer",
      },
      {
        title: "4. Confirm the schedule bar and Schedule",
        paragraphs: [
          "Back in Create post, the footer shows the selected time (for example Schedule · Aug 6 11:31 PM). Use Clear next to the time if you need to pick again, then select Schedule to queue the post.",
        ],
        imageKey: "sched-time-set",
        imageAlt:
          "Create post footer showing Schedule with selected date and time and Schedule button",
        note: "You can still Save draft without scheduling, or Publish to send immediately instead of queuing.",
      },
      {
        title: "Good habits",
        bullets: [
          "Start with one channel when validating a new workflow.",
          "Use previews to catch text length and media issues before they go live.",
          "Treat the first scheduled post as a workflow test, not a major campaign.",
        ],
      },
    ],
  },
  {
    slug: "manage-your-calendar-and-queue",
    categorySlug: "scheduling-publishing",
    title: "Manage your calendar and queue",
    summary:
      "Use Content Pipeline on Calendar to see Scheduled posts, open empty slots, and keep the queue clear.",
    keywords: [
      "calendar",
      "queue",
      "schedule",
      "upcoming posts",
      "content pipeline",
      "reschedule",
    ],
    featured: false,
    readTime: "5 min",
    updatedAt: "2026-08-06",
    body: [
      {
        title: "Open Content Pipeline",
        paragraphs: [
          "Go to Calendar in the sidebar. Content Pipeline lists days with Custom date & time cards, empty + New time slots, and any posts already Scheduled.",
        ],
        imageKey: "sched-pipeline",
        imageAlt:
          "Calendar Content Pipeline showing a Scheduled LinkedIn post and empty time slots",
      },
      {
        title: "Scheduled posts on the pipeline",
        paragraphs: [
          "A Scheduled card shows the channel, caption, thumbnail, and time. Use Edit (pencil) to change copy, media, or timing, Preview (eye) to review, or Delete post to remove it from the queue.",
        ],
      },
      {
        title: "Empty slots and Schedule Post",
        bullets: [
          "Select + New on a time slot to compose for that moment.",
          "Use Custom date & time when you need a picker instead of a preset hour.",
          "Use + Schedule Post in the header to open compose without picking a slot first.",
        ],
      },
      {
        title: "Calendar habits that reduce mistakes",
        bullets: [
          "Check the active workspace before editing or rescheduling.",
          "Treat Content Pipeline as the team source of truth for what ships next.",
          "Review back-to-back posts on the same network to avoid clustering.",
        ],
      },
    ],
  },
  {
    slug: "use-the-unified-composer",
    categorySlug: "managing-posts",
    title: "Use the unified composer",
    summary:
      "Create post lets you pick channels, write once or per platform, attach media, preview live, then save, schedule, or publish.",
    keywords: [
      "composer",
      "draft",
      "preview",
      "copy",
      "create post",
      "live preview",
      "same for all",
      "per platform",
      "clear composer",
      "clear everything",
    ],
    featured: true,
    readTime: "5 min",
    updatedAt: "2026-08-06",
    body: [
      {
        title: "Open Create post",
        paragraphs: [
          "Create post is the unified composer for every connected channel. Use Same for all for shared copy, or Per platform specific when a network needs different text or media. Turn on Live preview to see how the post will look.",
        ],
        imageKey: "composer-unified",
        imageAlt:
          "Create post unified composer with social channels, Same for all, attached media, and Facebook live preview",
      },
      {
        title: "What you can set",
        bullets: [
          "Social channels — select the accounts to publish to, or use + to add more.",
          "Post format — Reel, Story, or Link when the selected networks support them.",
          "Network fields — for example Pinterest pin title or YouTube video title when those channels are selected.",
          "Post body and Attached media — write the caption and upload photos or videos.",
        ],
      },
      {
        title: "Live preview for all channels",
        paragraphs: [
          "Turn on Live preview. With Same for all, one draft feeds every selected channel. Use the Preview pills (Facebook, LinkedIn, Pinterest, Instagram, TikTok, Bluesky, and others) to switch networks and confirm text, media, and layout before you Save draft, Schedule, or Publish.",
        ],
        imageKey: "live-preview",
        imageAlt:
          "Create post Live preview on with Same for all and LinkedIn preview among platform pills",
        note: "Switch to Per platform specific only when a network needs different copy or media. Keep Live preview on while you flip pills so each channel still looks right.",
      },
      {
        title: "Find the Clear button",
        paragraphs: [
          "In Create post, the Clear button sits at the top of the composer (trash icon + Clear), next to Live preview and AI assistant. Use it when you want to wipe the current draft and start over.",
        ],
        imageKey: "composer-clear-btn",
        imageAlt:
          "Create post composer with Clear button highlighted next to Live preview and AI assistant",
      },
      {
        title: "Confirm Clear everything",
        paragraphs: [
          "After you select Clear, confirm Clear composer? — Clear everything removes all text, media, platform fields, and channel-specific drafts saved in this browser for the current workspace. Cancel keeps your work.",
        ],
        imageKey: "composer-clear",
        imageAlt:
          "Clear composer confirmation dialog with Cancel and Clear everything",
        note: "Clear everything cannot be undone. Save draft first if you might need the content later.",
      },
      {
        title: "Recommended draft flow",
        steps: [
          {
            title: "Pick channels",
            body: "Select the accounts that should receive this draft so previews and limits stay accurate.",
          },
          {
            title: "Write and attach media",
            body: "Add the post body and uploads. Watch character limits and the live preview on the right.",
          },
          {
            title: "Preview every channel",
            body: "Click each Preview pill to check how the same post renders on LinkedIn, Instagram, Pinterest, and the rest.",
          },
          {
            title: "Tune per platform when needed",
            body: "Switch to Per platform specific only for networks that need a different treatment.",
          },
          {
            title: "Save, schedule, or publish",
            body: "Use Save draft (keeps text and images), Schedule (with a picked time), or Publish from the same footer.",
          },
        ],
        note: "Drafts keep attached images. See Save and manage drafts for the drafts list. For Generate Post and image tools, open AI assistant — see Use the AI Toolkit in Create post.",
      },
    ],
  },
  {
    slug: "save-and-manage-drafts",
    categorySlug: "managing-posts",
    title: "Save and manage drafts (with images)",
    summary:
      "Attach photos or videos in Create post, confirm Save as draft, then open Drafts under Published Content to edit, view, or delete — including image thumbnails.",
    keywords: [
      "draft",
      "save draft",
      "drafts",
      "attached media",
      "image",
      "published content",
      "edit draft",
    ],
    featured: true,
    readTime: "5 min",
    updatedAt: "2026-08-06",
    body: [
      {
        title: "Add an image on a draft",
        paragraphs: [
          "In Create post, use Attached media to drag & drop or click to upload photos or videos. The thumbnail appears under the post body and in Live preview. Images stay with the draft when you save.",
        ],
        imageKey: "sched-composer",
        imageAlt:
          "Create post with attached moon image thumbnail and LinkedIn live preview",
      },
      {
        title: "1. Save as draft",
        paragraphs: [
          "Select Save draft in the footer. Confirm Save as draft? — Postsiva shows how many channels will get a draft in parallel and lists each publish target (for example LinkedIn). Select Save draft again to confirm, or Cancel to keep editing.",
        ],
        imageKey: "draft-save",
        imageAlt:
          "Save as draft confirmation listing LinkedIn channel with Cancel and Save draft",
      },
      {
        title: "2. Find drafts under Published Content",
        paragraphs: [
          "Open Published Content in the sidebar, then select the Drafts tab. Each card shows the image thumbnail (when media was attached), channel icon, title/caption, and DRAFT badge.",
        ],
        imageKey: "draft-list",
        imageAlt:
          "Published Content Drafts tab with draft cards showing image thumbnails and edit actions",
      },
      {
        title: "3. Edit, view, or delete a draft",
        bullets: [
          "Edit (pencil) — reopen Create post to change caption, replace or add images, then save, schedule, or publish.",
          "View (eye) — preview the draft without editing.",
          "Delete (trash) — remove the draft from the list.",
        ],
        note: "You can add or change images anytime while the item is still a draft. After you schedule it, use Edit scheduled post on the calendar instead.",
      },
    ],
  },
  {
    slug: "edit-a-scheduled-draft-safely",
    categorySlug: "managing-posts",
    title: "Edit and reschedule a scheduled post",
    summary:
      "Open Edit scheduled post from the calendar, change caption or media, pick a new time, then Update — or publish now, move to drafts, or delete.",
    keywords: [
      "edit scheduled post",
      "reschedule",
      "draft",
      "scheduled draft",
      "update post",
      "choose time",
    ],
    featured: false,
    readTime: "5 min",
    updatedAt: "2026-08-06",
    body: [
      {
        title: "Open the scheduled post",
        paragraphs: [
          "In Calendar → Content Pipeline, find the Scheduled card and select Edit (pencil). Edit scheduled post opens with the current image, caption, and selected time.",
        ],
        imageKey: "sched-edit-reschedule",
        imageAlt:
          "Edit scheduled post modal with caption, selected time, Choose time, Update, and Publish now",
      },
      {
        title: "Change copy or media",
        bullets: [
          "Edit the Caption field (limits still apply).",
          "Use Change image to replace attached media.",
          "Confirm you are editing the correct workspace item before saving.",
        ],
      },
      {
        title: "Reschedule the time",
        paragraphs: [
          "Selected time shows the current slot. Select Choose time to open Pick a time again, pick a new list slot or custom date & time, then confirm. Use Clear if you want to remove the schedule before re-picking.",
        ],
        note: "After you pick a new slot, select Update (or Schedule in the time section) so the pipeline stores the new time — changing the picker alone is not enough.",
      },
      {
        title: "Update, publish now, or remove",
        bullets: [
          "Update — save caption, media, and schedule changes.",
          "Publish now — send immediately instead of waiting for the slot.",
          "Move to drafts — keep the content without a publish time.",
          "Delete — remove the scheduled item from the queue.",
        ],
      },
    ],
  },
  {
    slug: "connect-canva-and-cloud-media",
    categorySlug: "media-canva",
    title: "Attach media: library, stock, Canva, and cloud",
    summary:
      "Open Attach Media in Create post to upload from device, pick from your library, browse stock, or use connected Drive, Dropbox, OneDrive, and Canva.",
    keywords: [
      "canva",
      "google drive",
      "dropbox",
      "onedrive",
      "media",
      "attach media",
      "media library",
      "stock",
      "unsplash",
      "upload",
    ],
    featured: true,
    readTime: "6 min",
    updatedAt: "2026-08-06",
    body: [
      {
        title: "Open Attach Media",
        paragraphs: [
          "In Create post, use Attached media (drag & drop or click) to open Attach Media. Import from device, library, stock, or cloud. Design with Canva when it shows Connected. Some design tools may show Coming soon.",
        ],
        imageKey: "media-attach",
        imageAlt:
          "Attach Media modal with From device, library, Stock, Google Drive, Dropbox, OneDrive, and Canva",
        note: "CONNECTED means that source is ready in this workspace. NOT CONNECTED means authorize it before you can browse files there.",
      },
      {
        title: "Media library",
        paragraphs: [
          "Choose From library to open Media library. Filter All / Photos / Videos / Documents, search, Refresh, or Upload. Select an item (it shows ADDED), then Done to attach it to the post.",
        ],
        imageKey: "media-library",
        imageAlt:
          "Media library grid with filters, upload, and a selected image marked ADDED",
      },
      {
        title: "Stock media",
        paragraphs: [
          "Choose Stock to browse Stock media. Search (for example Technology), pick a category, switch Photos or Videos, set resolution and source (such as Unsplash), then select images and Done.",
        ],
        imageKey: "media-stock",
        imageAlt:
          "Stock media browser with Technology category, Unsplash photos, and Done",
      },
      {
        title: "Connect Canva and cloud drives",
        steps: [
          {
            title: "Open Attach Media",
            body: "From Create post, open the media picker so you can see Google Drive, Dropbox, OneDrive, and Canva status.",
          },
          {
            title: "Authorize the provider",
            body: "If a source shows NOT CONNECTED, select it and complete sign-in.",
          },
          {
            title: "Pick files into the draft",
            body: "Browse the connected source, select assets, then return to Create post — thumbnails appear under Attached media and in Live preview.",
          },
        ],
        note: "Cloud and Canva keep creative files closer to publishing so you avoid manual downloads for every draft.",
      },
    ],
  },
  {
    slug: "use-the-unified-inbox-and-bulk-ai-replies",
    categorySlug: "ai-automation",
    title: "Unified inbox: generate replies with AI and Post all",
    summary:
      "Open Inbox across all platforms, check comment score, generate AI replies for unreplied comments in one go, then Post all with one click.",
    keywords: [
      "inbox",
      "unified inbox",
      "bulk replies",
      "generate for all",
      "post all",
      "ai reply",
      "comment score",
      "unreplied",
    ],
    featured: true,
    readTime: "6 min",
    updatedAt: "2026-08-06",
    body: [
      {
        title: "Open the unified inbox",
        paragraphs: [
          "Select Inbox in the sidebar. Use the social channels column (All platforms or a single account) to filter comments and messages from every connected network in one feed.",
        ],
        imageKey: "unified-inbox",
        imageAlt:
          "Unified Inbox with All platforms selected, message feed, and Comment score overlay",
      },
      {
        title: "Comment score",
        paragraphs: [
          "Comment score tracks how you reply to and clear comments across channels (response rate, attention cleared, consistency). Use it as a quick health check before bulk-replying.",
        ],
      },
      {
        title: "Generate replies with AI in one go",
        paragraphs: [
          "Filter to Unreplied (or a similar view). Under Bulk replies, select Generate for all to fill each open reply box with AI. Edit any row that needs a personal touch.",
        ],
        imageKey: "inbox-bulk-ai",
        imageAlt:
          "Bulk replies with Generate for all and Post all for unreplied comments",
        note: "Generate for all uses AI credits. Review replies before you post — AI drafts should match your brand voice.",
      },
      {
        title: "Post all with one click",
        steps: [
          {
            title: "Generate for all",
            body: "Select Generate for all (N) so every eligible unreplied comment gets a draft reply in its box.",
          },
          {
            title: "Edit if needed",
            body: "Skim the list. Change any reply, or use Reply / Category on a single row.",
          },
          {
            title: "Post all",
            body: "When drafts look good, select Post all to publish replies in one click. You can also Post on a single row if you only want to send a few.",
          },
        ],
        note: "Post all stays unavailable (0) until generated replies are ready. Refresh the feed after posting to confirm unreplied counts drop.",
      },
    ],
  },
  {
    slug: "use-ai-toolkit-in-create-post",
    categorySlug: "ai-automation",
    title: "Use the AI Toolkit in Create post",
    summary:
      "Open AI assistant in the composer to generate posts, create images, turn media into captions, and edit visuals before you schedule or publish.",
    keywords: [
      "ai toolkit",
      "ai assistant",
      "generate post",
      "image generation",
      "image to content",
      "video to content",
      "edit image",
      "digital architect",
    ],
    featured: true,
    readTime: "5 min",
    updatedAt: "2026-08-06",
    body: [
      {
        title: "Open the AI Toolkit",
        paragraphs: [
          "In Create post, select AI assistant. The AI Toolkit panel opens beside the composer (Digital Architect). Keep Live preview on so you can see generated text and media as you work.",
        ],
        imageKey: "ai-toolkit",
        imageAlt:
          "Create post with AI Toolkit open showing language, Describe your idea, Generate Post, and image tools",
      },
      {
        title: "Generate a post from an idea",
        steps: [
          {
            title: "Set output language",
            body: "Choose the AI output language (for example English), then Save output language if you change it.",
          },
          {
            title: "Describe your idea",
            body: "Write a short prompt in Describe your idea — topic, tone, and any details you want in the caption.",
          },
          {
            title: "Generate Post",
            body: "Select Generate Post. Review the result in the post body and preview, then edit before Save draft, Schedule, or Publish.",
          },
        ],
      },
      {
        title: "Other toolkit tools",
        bullets: [
          "Image generation — create visuals from a prompt.",
          "Image to content — turn an attached or selected image into caption ideas.",
          "Video to content — generate copy from video context when available.",
          "Edit image — adjust an image before it stays on the draft.",
        ],
        note: "AI uses workspace AI credits. Start with a draft you can review — do not publish generated content without checking channel limits and brand voice.",
      },
    ],
  },
  {
    slug: "use-postsiva-gpt-and-mcp",
    categorySlug: "ai-automation",
    title: "Use Postsiva GPT and MCP safely",
    summary: "Understand where ChatGPT Apps and MCP fit into Postsiva so automation stays useful and scoped.",
    keywords: ["gpt", "mcp", "automation", "chatgpt", "cursor"],
    featured: true,
    readTime: "5 min",
    updatedAt: "2026-08-06",
    body: [
      {
        title: "What each surface is for",
        bullets: [
          "Postsiva GPT is for guided user-facing workflows inside ChatGPT Apps.",
          "MCP is for tool access from clients like Cursor, Claude, or other agent-capable environments.",
          "Both should respect the same workspace boundaries and permission model as the web app.",
        ],
      },
      {
        title: "Operational advice",
        bullets: [
          "Start with low-risk drafts before attempting broader automation.",
          "Keep an eye on plan limits and key scopes when experimenting.",
          "Treat agent-connected publishing as part of the same review process you use in the app.",
        ],
        note: "For the in-app composer tools (Generate Post, image generation, and media-to-content), see Use the AI Toolkit in Create post.",
      },
    ],
  },
  {
    slug: "set-up-workspaces-and-switching",
    categorySlug: "workspaces-team",
    title: "Set up workspaces and switch safely",
    summary: "Keep brands and clients isolated, and avoid publishing from the wrong context when switching workspaces.",
    keywords: ["workspace", "switch", "team", "client", "create workspace"],
    featured: false,
    readTime: "4 min",
    updatedAt: "2026-08-06",
    body: [
      {
        title: "Why workspace discipline matters",
        paragraphs: [
          "Most cross-brand mistakes happen because the wrong workspace stays active. Good workspace hygiene protects calendars, accounts, and approvals.",
        ],
      },
      {
        title: "Create another workspace anytime",
        paragraphs: [
          "Open the workspace selector in the top-right header, then choose + Create workspace and name the new environment.",
        ],
        imageKey: "workspace-create-menu",
        imageAlt:
          "Workspace dropdown with Create workspace highlighted for adding another workspace",
        note: "For the full create flow with screenshots, see Start your first Postsiva workspace under Getting started.",
      },
      {
        title: "Recommended structure",
        bullets: [
          "One workspace per brand or client.",
          "Invite only the people who need access to that workspace.",
          "Confirm the active workspace before connecting accounts or scheduling content.",
        ],
      },
    ],
  },
  {
    slug: "invite-teammates-and-set-access",
    categorySlug: "workspaces-team",
    title: "Invite teammates and set workspace access",
    summary:
      "Open Team members, invite by email with a role, then confirm they appear as Active members in the workspace.",
    keywords: [
      "invite team",
      "team members",
      "permissions",
      "workspace access",
      "collaborators",
      "editor",
      "owner",
      "invite member",
    ],
    featured: true,
    readTime: "5 min",
    updatedAt: "2026-08-06",
    body: [
      {
        title: "Before you invite",
        bullets: [
          "Confirm the correct workspace is active in the header (invites belong to that workspace only).",
          "Invite people into the smallest role they need — Owner keeps billing and account control.",
          "Use a real email they can open; existing Postsiva users join right away, new users get a 7-day join link.",
        ],
      },
      {
        title: "1. Open Team members",
        paragraphs: [
          "In the workspace sidebar, select Team members. The Members page lists Active members (name, role, social accounts) and Pending invitations for people who have not joined yet.",
        ],
        imageKey: "team-members",
        imageAlt:
          "Members page with Invite Member button, owner row, and Pending invitations empty state",
      },
      {
        title: "2. Invite member",
        paragraphs: [
          "Select Invite Member. Enter their email address, choose a role (for example Editor), then select Add member. Cancel closes without sending.",
        ],
        imageKey: "team-invite",
        imageAlt:
          "Invite member modal with email address, Editor role, Cancel, and Add member",
        note: "If they already use Postsiva, we add them right away. If not, we send a 7-day link to create a password and join.",
      },
      {
        title: "3. Confirm they were added",
        paragraphs: [
          "After a successful invite, a banner confirms the email was added. The Members table shows the new person with their role (for example Editor) next to the Owner. Pending invitations stay empty when they joined immediately.",
        ],
        imageKey: "team-added",
        imageAlt:
          "Members list with two workspace members after invite success banner",
      },
      {
        title: "Roles and pending invites",
        bullets: [
          "Owner — full workspace control, including connections and billing-sensitive actions.",
          "Editor (and other roles) — collaborate on content with the access that role allows.",
          "Pending — invitees who have not accepted yet appear under Pending invitations; use Resend email if the link expired.",
          "After they join, they move to Active in the members list above.",
        ],
      },
    ],
  },
  {
    slug: "understand-plans-and-billing",
    categorySlug: "billing-plans",
    title: "Understand plans and billing basics",
    summary:
      "Compare Free, Starter, and Pro from the same catalog as the homepage pricing section, then see Pro Active in the app.",
    keywords: [
      "billing",
      "plan",
      "subscription",
      "limits",
      "pro plan",
      "starter",
      "free",
      "pricing",
      "active",
      "yearly",
      "monthly",
    ],
    featured: true,
    readTime: "6 min",
    updatedAt: "2026-08-06",
    specialRenderer: "billing-plans-landing",
    body: [
      {
        title: "Pro plan Active in the app",
        paragraphs: [
          "When Pro is active, the header shows CURRENT PLAN with an Active badge, then Pro with remaining posts, AI credits, and billing period (for example Billed yearly). Calendar, Inbox, AI Watcher, and social analytics stay available — not locked behind upgrade cards.",
        ],
        imageKey: "plan-pro",
        imageAlt:
          "Postsiva Pro plan Active header with posts and AI credits, LinkedIn analytics, and unlocked navigation",
      },
      {
        title: "What Pro unlocks in the product",
        bullets: [
          "Higher posts and AI credit allowances shown in the header.",
          "Full nav — Dashboard, Calendar, Published Content, Inbox, News, AI Watcher without padlocks.",
          "Channel analytics on Social accounts (posts, comments, reach, likes, engagement).",
        ],
        note: "For Free plan locks and upgrading from Free, see Understand Free plan, limits, and upgrades.",
      },
    ],
  },
  {
    slug: "understand-trials-limits-and-upgrades",
    categorySlug: "billing-plans",
    title: "Understand Free plan, limits, and upgrades",
    summary:
      "See how Free plan shows in the header, which features stay locked, and when to upgrade for analytics and more posts.",
    keywords: [
      "trial",
      "limits",
      "upgrade",
      "free plan",
      "billing",
      "posts left",
      "ai credits",
      "analytics",
    ],
    featured: true,
    readTime: "5 min",
    updatedAt: "2026-08-06",
    body: [
      {
        title: "Free plan in your workspace",
        paragraphs: [
          "When Free is active, the header shows CURRENT PLAN Free with remaining posts and AI credits (for example 5 posts left · 0 AI credits left). Connected accounts can still show Active — plan limits control features and quotas, not whether a channel stays linked.",
        ],
        imageKey: "plan-free",
        imageAlt:
          "Postsiva Free plan header with locked Calendar and Inbox, Active Instagram account, and Upgrade to unlock Analytics",
      },
      {
        title: "What Free locks or limits",
        bullets: [
          "Header quotas — posts left and AI credits left for this billing period.",
          "Locked nav items — Calendar, Inbox, AI Watcher, and similar features may show a padlock until you upgrade.",
          "Analytics — Social accounts may show Upgrade to unlock Analytics with a View plans button instead of full insights.",
        ],
        note: "You can still open Social accounts, connect platforms within Free limits, and use Create for remaining posts. Compare Free vs Starter vs Pro on Understand plans and billing basics, then upgrade when you need schedule, inbox, or more posts.",
      },
      {
        title: "Upgrade when you need more",
        steps: [
          {
            title: "Open plans from the upgrade prompt",
            body: "Select View plans on the analytics upgrade card, or open billing settings from your plan area.",
          },
          {
            title: "Choose the plan that removes the blocker",
            body: "Upgrade when you need more posts, AI credits, calendar scheduling, inbox, or analytics — not only for headroom you will not use yet.",
          },
          {
            title: "Confirm Free vs paid in the header",
            body: "After upgrading, CURRENT PLAN should show your paid tier (for example Pro Active) and updated posts / AI credit balances.",
          },
        ],
      },
    ],
  },
  {
    slug: "fix-failed-account-connection",
    categorySlug: "troubleshooting",
    title: "Fix a failed account connection",
    summary: "Work through the most common reasons a social connection flow fails before opening a support ticket.",
    keywords: ["troubleshooting", "oauth", "connection failed", "permissions"],
    featured: true,
    readTime: "5 min",
    updatedAt: "2026-08-06",
    body: [
      {
        title: "Check these first",
        bullets: [
          "Are you using the correct login for the social property?",
          "Does that identity have the required admin or publishing access?",
          "Are you connecting from the correct workspace?",
          "Was the account previously attached somewhere else?",
        ],
      },
      {
        title: "Recovery flow",
        steps: [
          {
            title: "Retry with the correct identity",
            body: "Log out of the wrong social session and restart the connect flow cleanly.",
          },
          {
            title: "Review permissions outside Postsiva",
            body: "Fix page, organization, or business roles directly in the source platform before reconnecting.",
          },
          {
            title: "Reconnect from the intended workspace",
            body: "Avoid attaching the account in one workspace and expecting it in another.",
          },
        ],
      },
    ],
  },
  {
    slug: "fix-a-post-that-wont-publish",
    categorySlug: "troubleshooting",
    title: "Fix a post that won’t publish",
    summary: "Troubleshoot publishing failures by checking channel connection health, media fit, and timing assumptions.",
    keywords: ["publish failed", "post failed", "schedule error", "publishing"],
    featured: true,
    readTime: "5 min",
    updatedAt: "2026-08-06",
    body: [
      {
        title: "Most common causes",
        bullets: [
          "The channel connection expired or no longer has the right permissions.",
          "Media or copy no longer fits the destination network’s constraints.",
          "The scheduled context changed and the wrong workspace or account was selected.",
        ],
      },
      {
        title: "Fast recovery path",
        steps: [
          {
            title: "Check the channel status",
            body: "Confirm the account is still connected and healthy before editing the content itself.",
          },
          {
            title: "Open previews again",
            body: "Look for text length, media, or render issues that may have been introduced after the draft was first saved.",
          },
          {
            title: "Retry with a controlled edit",
            body: "Fix one likely issue at a time so you know what actually resolved the failure.",
          },
        ],
      },
    ],
  },
  {
    slug: "self-hosted",
    categorySlug: "wordpress",
    title: "Connect a self-hosted WordPress site",
    summary: "Use an Application Password from your WordPress profile to connect a self-hosted site to Postsiva.",
    keywords: ["wordpress", "self hosted", "application password", "blog"],
    featured: true,
    readTime: "6 min",
    updatedAt: "2026-08-06",
    specialRenderer: "wordpress-self-hosted",
    body: [
      {
        title: "WordPress guide",
        paragraphs: [
          "This guide uses the existing Postsiva self-hosted WordPress walkthrough as the article body.",
        ],
      },
    ],
  },
] as const;
