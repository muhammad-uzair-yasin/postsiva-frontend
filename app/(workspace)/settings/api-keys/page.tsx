import { redirect } from "next/navigation";

/** @deprecated Use `/integrations/api-keys`. */
export default function SettingsApiKeysPage(): never {
  redirect("/integrations/api-keys");
}
