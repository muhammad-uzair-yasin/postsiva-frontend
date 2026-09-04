import type { Metadata } from "next";
import dynamic from "next/dynamic";

import { AuthFormSkeleton } from "@/components/auth/AuthFormSkeleton";

export const metadata: Metadata = {
  title: "Forgot password | Postsiva",
  description: "Reset your Postsiva account password.",
};

const ForgotPasswordScreen = dynamic(
  () =>
    import("./_components/ForgotPasswordScreen").then((m) => ({
      default: m.ForgotPasswordScreen,
    })),
  { loading: () => <AuthFormSkeleton /> },
);

export default function ForgotPasswordPage(): React.ReactElement {
  return <ForgotPasswordScreen />;
}
