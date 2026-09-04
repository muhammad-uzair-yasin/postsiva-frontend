import { redirect } from "next/navigation";

/** Refer & Earn lives at `/referrals`. */
export default function SettingsReferralsRedirect(): never {
  redirect("/referrals");
}
