import { redirect } from "next/navigation";

/** AI Usage is now user-global — moved to the account area. */
export default function SettingsAiUsageRedirect(): never {
  redirect("/account/ai-usage");
}
