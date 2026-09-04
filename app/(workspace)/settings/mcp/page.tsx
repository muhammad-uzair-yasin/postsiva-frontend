import { redirect } from "next/navigation";

/** @deprecated Use `/integrations/mcp`. */
export default function SettingsMcpRedirectPage(): never {
  redirect("/integrations/mcp");
}
