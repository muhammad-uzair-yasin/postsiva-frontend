export type IntegrationStep = {
  title: string;
  content: string;
  subsections?: { title: string; body: string; copyValue?: string }[];
  codeBlock?: string;
  note?: string;
};

export type IntegrationTab = {
  id: string;
  label: string;
  setupSteps: IntegrationStep[];
};

export type Integration = {
  slug: string;
  name: string;
  description: string;
  subtitle?: string;
  longDescription?: string;
  comingSoon?: boolean;
  earlyAccessLink?: string;
  externalCta?: { label: string; url: string };
  setupSteps?: IntegrationStep[];
  tabs?: IntegrationTab[];
  examplePrompts?: string[];
};

// Keep this data in parity with linkedin-postsiva integrations data.
export const INTEGRATIONS: Integration[] = [
  {
    slug: 'zapier',
    name: 'Zapier',
    description: 'Automate workflows with Zapier',
    subtitle: 'Automate workflows with Zapier',
    longDescription:
      'Zapier supercharges Postsiva with 5,000+ no-code integrations. Auto-post updates to Discord, transform Trello cards into ready-to-schedule drafts, and more.',
    setupSteps: [
      {
        title: 'Create an API Key or copy an existing one',
        content:
          'You need an API key to integrate Postsiva with Zapier. Use your existing key below or create a new one.',
        subsections: [
          {
            title: 'API Keys',
            body: 'Generate an API key to integrate Postsiva with Zapier.',
            copyValue: '',
          },
        ],
      },
      {
        title: 'Navigate to Zapier connections',
        content: 'Click "Add connection" to connect Postsiva. Zapier Connections',
      },
      {
        title: 'Search for MCP Client',
        content: 'Search for "MCP Client by Zapier" and select it, then click "Add connection".',
      },
      {
        title: 'Configure the connection',
        content: 'Fill in the form with the following settings:',
        subsections: [
          { title: 'Server URL', body: 'Your Postsiva MCP server URL', copyValue: 'https://mcp.postsiva.com/mcp' },
          { title: 'Transport', body: 'Streamable HTTP' },
          { title: 'OAuth', body: 'No' },
          { title: 'Bearer Token', body: 'Your API key', copyValue: 'API_KEY' },
        ],
      },
      {
        title: 'Complete the setup',
        content: 'Click "Yes, Continue to MCP Client by Zapier" to finish.',
      },
    ],
    examplePrompts: [
      'When a new blog post is published in WordPress, create a LinkedIn text post with the post title and link',
      'When a new row is added to my Google Sheet, create a LinkedIn text post with that content',
      'Every Monday at 9am, get my LinkedIn posts and send a summary to Slack',
    ],
  },
  {
    slug: 'mcp',
    name: 'MCP',
    description: 'Connect web and local tools to the right Postsiva MCP server',
    subtitle: 'Connect web and local tools to the right Postsiva MCP server',
    longDescription:
      "Postsiva has Unified MCP endpoints for all platforms, plus nine platform-specific MCP servers (LinkedIn, Instagram, TikTok, Facebook, YouTube, Threads, Bluesky, Pinterest, Mastodon). Use Unified MCP (web) for Claude.ai and GPT UI; use Unified MCP (local) or a platform URL for Cursor, Claude Code, and other IDEs. Each server shows an MCP name and description to paste into GPT connectors.",
    setupSteps: [
      {
        title: 'For Claude.ai and GPT UI clients',
        content:
          'Copy the Unified MCP (web) URL from the config block above and paste it into the hosted connector setup.',
      },
      {
        title: 'For Claude Code, Cursor, and local IDEs',
        content:
          'Copy the JSON config from the config block above and paste it into your local MCP client settings.',
      },
      {
        title: 'Test the tools',
        content: 'After saving the connection, use one of the test prompts at the end of this page.',
      },
    ],
    examplePrompts: [
      'Check if my LinkedIn is connected',
      'Get my LinkedIn profile',
      "Get my LinkedIn posts (or my organization's posts)",
      "Create a LinkedIn text post that says 'Excited to share our latest update!'",
      "Turn the idea 'tips for remote work' into a LinkedIn post using idea_to_post",
      'Rephrase this paragraph for LinkedIn',
      'Get comments on my latest post and reply to one',
      'Get stats (likes, comments) for one of my posts',
    ],
  },
  {
    slug: 'n8n',
    name: 'n8n',
    description: 'Workflow automation with n8n',
    subtitle: 'Workflow automation with n8n',
    longDescription:
      'n8n is a workflow automation tool that connects Postsiva with hundreds of apps. Create complex automation workflows, trigger posts based on events, and integrate Postsiva into your existing automation pipelines.',
    setupSteps: [
      {
        title: 'Create an API Key or copy an existing one',
        content:
          'You need an API key to integrate Postsiva with n8n. Use your existing key below or create a new one.',
        subsections: [{ title: 'API Keys', body: 'Generate an API key to integrate Postsiva with n8n.', copyValue: '' }],
      },
      {
        title: 'Add MCP Client to workflow',
        content: 'Inside of a workflow, add an "MCP Client" node.',
      },
      {
        title: 'Configure the MCP Client',
        content: 'Set the following in the MCP Client node:',
        subsections: [
          { title: 'Server Transport', body: 'HTTP Streamable' },
          { title: 'MCP Endpoint URL', body: 'https://mcp.postsiva.com/mcp', copyValue: 'https://mcp.postsiva.com/mcp' },
          { title: 'Authentication', body: 'Bearer Auth' },
        ],
      },
      {
        title: 'Add your credentials',
        content: 'Click on "Credential for Bearer Auth" and configure:',
        subsections: [
          { title: 'Select', body: '"Create new credential"' },
          { title: 'Add your API key', body: 'API_KEY', copyValue: 'API_KEY' },
          { title: 'Then', body: 'Click "Save" and close the modal' },
        ],
        note: 'Replace API_KEY with your API key from Step 1.',
      },
      {
        title: 'Select Postsiva MCP tools',
        content:
          'Select the MCP tool you want the workflow to use from the available Postsiva MCP tools, then configure it as needed.',
      },
    ],
    examplePrompts: [
      'When a new RSS feed item appears, create a LinkedIn text post with the article title and link',
      'Every Friday, get my LinkedIn posts and send a summary to Slack',
      'When a form submission comes in, create a LinkedIn text post with the form data',
    ],
  },
  {
    slug: 'chatgpt',
    name: 'ChatGPT',
    description: 'Manage your content from ChatGPT',
    longDescription:
      'Use the Postsiva Social Media Manager Custom GPT in ChatGPT to manage your social accounts from conversation. Open the GPT, connect your workspace (OAuth), then create posts, view latest posts and stats, generate images, and more.',
    externalCta: {
      label: 'Go to ChatGPT',
      url: 'https://chatgpt.com/g/g-69ad8aedce9c8191b2d359b425f05ed2-postsiva-social-media-manager',
    },
    setupSteps: [
      {
        title: 'Open Postsiva Social Media Manager',
        content:
          'In ChatGPT, open the Postsiva Social Media Manager GPT (or use the Go to ChatGPT button).',
      },
      {
        title: 'Connect your workspace',
        content:
          'Click Connect to Postsiva, sign in, and select the workspace you want ChatGPT to manage.',
      },
      {
        title: 'Start chatting',
        content:
          'Ask ChatGPT to list accounts, draft posts, schedule content, or check analytics for that workspace.',
      },
    ],
  },
  {
    slug: 'claude',
    name: 'Claude',
    description: 'Manage your content from Claude',
    subtitle: 'Manage your content from Claude.',
    longDescription:
      'Claude lets you manage your Postsiva content using natural language. Add Postsiva as a custom connector, then create posts, schedule content, and manage social accounts directly from Claude.',
    examplePrompts: [
      'Get my LinkedIn profile',
      'Get my LinkedIn posts',
      "Create a LinkedIn text post that says 'We just launched our redesigned dashboard!'",
      "Turn the idea 'product launch announcement' into a LinkedIn post using idea_to_post",
      'Get comments on my latest LinkedIn post',
      'Get post stats (likes, impressions) for a post',
    ],
    tabs: [
      {
        id: 'claude-connector',
        label: 'Claude (Connectors)',
        setupSteps: [
          {
            title: 'Create an API Key or copy an existing one',
            content:
              'You need an API key to integrate Postsiva with Claude. Use your existing key below or create a new one.',
            subsections: [
              {
                title: 'API Keys',
                body: 'Generate an API key to integrate Postsiva with Claude.',
                copyValue: '',
              },
            ],
          },
          {
            title: 'Open Claude Settings',
            content: 'In Claude, open Settings.',
          },
          {
            title: 'Go to Connectors',
            content: 'Open the Connectors section.',
          },
          {
            title: 'Add a custom connector',
            content: 'Click Add connector, then Add custom connector.',
          },
          {
            title: 'Name the connector',
            content: 'Set the MCP name to Postsiva Social Media Manager.',
            subsections: [
              {
                title: 'Name',
                body: 'Postsiva Social Media Manager',
                copyValue: 'Postsiva Social Media Manager',
              },
            ],
          },
          {
            title: 'Paste the MCP URL with your API key',
            content:
              'Add this URL, replacing API_KEY with your workspace API key from Step 1. Do not wrap the key in quotes.',
            codeBlock: 'https://mcp.postsiva.com/web/mcp?api-key=API_KEY',
            note: 'Replace API_KEY with your API key from Step 1.',
          },
          {
            title: 'Save and enable',
            content:
              'Save the connector, then enable Postsiva Social Media Manager in chat to start using it.',
          },
        ],
      },
      {
        id: 'claude-code',
        label: 'Claude Code',
        setupSteps: [
          {
            title: 'Create an API Key or copy an existing one',
            content:
              'You need an API key to integrate Postsiva with Claude. Use your existing key below or create a new one.',
            subsections: [
              {
                title: 'API Keys',
                body: 'Generate an API key to integrate Postsiva with Claude.',
                copyValue: '',
              },
            ],
          },
          { title: 'Open Terminal', content: 'Open your terminal application.' },
          {
            title: 'Run installation command',
            content: 'Run the following command to add the Postsiva MCP server to Claude Code:',
            codeBlock:
              'claude mcp add --transport http postsiva https://mcp.postsiva.com/mcp --header "X-API-Key: API_KEY"',
            note: 'Replace API_KEY with your API key from Step 1.',
          },
          {
            title: 'Verify installation',
            content:
              'The Postsiva MCP server is now configured. You can start using Claude Code with Postsiva integration.',
          },
        ],
      },
    ],
  },
  {
    slug: 'cursor',
    name: 'Cursor',
    description: 'Build and automate from your editor',
    subtitle: 'Build and automate from your editor',
    longDescription:
      'Cursor lets you manage Postsiva directly from your code editor. Build automation scripts, create posts, and manage your social media workflow without leaving your development environment.',
    setupSteps: [
      {
        title: 'Create an API Key or copy an existing one',
        content:
          'You need an API key to integrate Postsiva with Cursor. Use your existing key below or create a new one.',
        subsections: [{ title: 'API Keys', body: 'Generate an API key to integrate Postsiva with Cursor.', copyValue: '' }],
      },
      { title: 'Open Cursor Settings', content: 'Open Cursor and go to "Settings".' },
      { title: 'Navigate to Cursor Settings', content: 'Navigate to "Cursor Settings".' },
      { title: 'Open Tools & MCP tab', content: 'Click on the "Tools & MCP" tab.' },
      {
        title: 'Add new MCP server',
        content: 'Click "New MCP Server" and add the following configuration:',
        codeBlock: `"mcpServers": {
  "unified-mcp": {
    "url": "https://mcp.postsiva.com/mcp",
    "headers": {
      "authorization": "Bearer API_KEY"
    }
  }
}`,
        note: 'Replace API_KEY with your API key from Step 1.',
      },
      { title: 'Save configuration', content: 'Save the configuration file to complete the setup.' },
    ],
    examplePrompts: [
      'Get my LinkedIn profile',
      'Get my LinkedIn posts',
      'Create a LinkedIn text post announcing the release of our new feature',
      'Rephrase this paragraph for LinkedIn',
      'Get comments on my LinkedIn post and reply to one',
      'Generate an image from this post content using content_to_image',
    ],
  },
  {
    slug: 'raycast',
    name: 'Raycast',
    description: 'Quick actions from your menu bar',
    subtitle: 'Quick actions from your menu bar',
    longDescription:
      'Raycast lets you quickly access Postsiva from your menu bar on macOS. Create posts, view your queue, and manage your social media with keyboard shortcuts and quick actions.',
    setupSteps: [
      {
        title: 'Create an API Key or copy an existing one',
        content:
          'You need an API key to integrate Postsiva with Raycast. Use your existing key below or create a new one.',
        subsections: [{ title: 'API Keys', body: 'Generate an API key to integrate Postsiva with Raycast.', copyValue: '' }],
      },
      {
        title: 'Open Install Server',
        content: "In Raycast, search for 'Install Server' and press Enter.",
      },
      {
        title: 'Configure the server',
        content: 'Fill in the form with the following details:',
        subsections: [
          { title: 'Name', body: 'Postsiva', copyValue: 'Postsiva' },
          { title: 'Transport', body: 'HTTP' },
          { title: 'URL', body: 'https://mcp.postsiva.com/mcp', copyValue: 'https://mcp.postsiva.com/mcp' },
        ],
      },
      {
        title: 'Add Authorization header',
        content: "In HTTP Headers, click on 'Add Item' and enter:",
        subsections: [
          { title: 'Key', body: 'Authorization', copyValue: 'Authorization' },
          { title: 'Value', body: 'Bearer API_KEY', copyValue: 'Bearer API_KEY' },
        ],
        note: 'Replace API_KEY with your API key from Step 1.',
      },
      {
        title: 'Install the server',
        content: "Click on 'Install' (or press Cmd+Enter) to complete the setup.",
      },
    ],
    examplePrompts: [
      "Create a LinkedIn text post that says 'Just shipped a new feature! Stay tuned for details.'",
      'Get my LinkedIn posts',
      "Create a LinkedIn text post that says 'Happy Monday! What are you working on this week?'",
    ],
  },
  {
    slug: 'perplexity',
    name: 'Perplexity',
    description: 'Manage your content from Perplexity',
    comingSoon: true,
    earlyAccessLink: '#',
  },
];

/** WhatsApp / DM setup pages (entry points from Settings → Integrations). */
export const SETTINGS_MESSAGING_INTEGRATIONS: readonly {
  href: string;
  name: string;
  description: string;
}[] = [
  {
    href: "/settings/whatsapp",
    name: "WhatsApp",
    description:
      "Link a workspace phone number and WhatsApp Business where supported.",
  },
  {
    href: "/settings/instagram-dm",
    name: "Instagram DM",
    description: "Connect the workspace agent via Instagram direct messages.",
  },
  {
    href: "/settings/facebook-dm",
    name: "Facebook DM",
    description: "Connect the workspace agent via Facebook direct messages.",
  },
];

/** MCP, API keys, and other automation guides (Integrations). */
export const SETTINGS_AUTOMATION_INTEGRATIONS: readonly {
  href: string;
  name: string;
  description: string;
}[] = [
  {
    href: "/integrations/api-keys",
    name: "API Keys",
    description: "Generate keys to authenticate API and automation requests.",
  },
  {
    href: "/integrations/mcp",
    name: "MCP",
    description: "Connect any tool to the Postsiva MCP server",
  },
];

export function pathnameIsIntegrationsArea(pathname: string): boolean {
  return pathname === "/integrations" || pathname.startsWith("/integrations/");
}

export function pathnameIsSettingsIntegrationsArea(pathname: string): boolean {
  if (pathnameIsIntegrationsArea(pathname)) {
    return true;
  }
  if (
    pathname === "/settings/integrations" ||
    pathname.startsWith("/settings/integrations/")
  ) {
    return true;
  }
  return SETTINGS_MESSAGING_INTEGRATIONS.some((m) => m.href === pathname);
}

export function getIntegrationBySlug(slug: string): Integration | undefined {
  return INTEGRATIONS.find((integration) => integration.slug === slug);
}
