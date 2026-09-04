import { redirect } from "next/navigation";

/** Drafts merged into the Published Content page as a plan-gated tab. */
export default function DraftsRedirect(): never {
  redirect("/content-manager?tab=draft");
}
