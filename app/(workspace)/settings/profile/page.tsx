import { redirect } from "next/navigation";

/** Profile is now user-global — moved to the account area. */
export default function SettingsProfileRedirect(): never {
  redirect("/account/profile");
}
