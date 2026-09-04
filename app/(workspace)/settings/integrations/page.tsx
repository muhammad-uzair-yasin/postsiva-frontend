import { redirect } from "next/navigation";

/** @deprecated Use `/integrations`. */
export default function SettingsIntegrationsRedirectPage(): never {
  redirect("/integrations");
}
