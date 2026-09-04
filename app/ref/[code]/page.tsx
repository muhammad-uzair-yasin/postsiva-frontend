import { redirect } from "next/navigation";

type Props = { params: Promise<{ code: string }> };

export default async function RefRedirectPage({ params }: Props): Promise<never> {
  const { code } = await params;
  const cleaned = (code || "").trim();
  redirect(cleaned ? `/signup?ref=${encodeURIComponent(cleaned)}` : "/signup");
}
