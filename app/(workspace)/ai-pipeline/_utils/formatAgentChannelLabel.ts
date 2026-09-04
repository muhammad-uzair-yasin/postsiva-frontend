/** Maps stored `turn_json.channel` values to short UI labels. */
const KNOWN: Record<string, string> = {
  website: "Website",
  whatsapp: "WhatsApp",
  instagram_dm: "Instagram DM",
  facebook_messenger: "Messenger",
};

export function formatAgentChannelLabel(raw: string | undefined): string {
  const key = raw?.trim().toLowerCase() ?? "";
  if (key.length === 0) {
    return "Unknown";
  }
  if (KNOWN[key]) {
    return KNOWN[key];
  }
  return key
    .split(/[_\s]+/)
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(" ");
}
