import { redirect } from "next/navigation";

/** Refer & Earn lives under the workspace shell at `/referrals`. */
export default function AccountReferralsRedirect(): never {
  redirect("/referrals");
}
