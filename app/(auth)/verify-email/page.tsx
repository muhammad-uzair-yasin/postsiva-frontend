import { redirect } from "next/navigation";

export default function VerifyEmailPage(): never {
  redirect("/verify-otp");
}
