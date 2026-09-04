import { redirect } from "next/navigation";

/** Trends hidden for now — route kept but does not load UI or call APIs. */
export default function TrendsPage(): never {
  redirect("/dashboard");
}
