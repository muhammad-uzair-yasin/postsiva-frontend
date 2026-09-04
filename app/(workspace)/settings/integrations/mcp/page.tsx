import { redirect } from "next/navigation";

/** @deprecated Use `/integrations/mcp`. */
export default function SettingsIntegrationsMcpRedirectPage(): never {
  redirect("/integrations/mcp");
}
