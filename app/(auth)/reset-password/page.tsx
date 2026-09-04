import type { Metadata } from "next";
import dynamic from "next/dynamic";
import { Suspense } from "react";

import { AuthFormSkeleton } from "@/components/auth/AuthFormSkeleton";
import { AuthPageFrame } from "@/app/(auth)/_components/AuthPageFrame";

export const metadata: Metadata = {
  title: "Reset password | Postsiva",
  description: "Set a new password for your Postsiva account.",
  robots: "noindex, nofollow",
};

const ResetPasswordScreen = dynamic(
  () =>
    import("./_components/ResetPasswordScreen").then((m) => ({
      default: m.ResetPasswordScreen,
    })),
  {
    loading: () => (
      <AuthPageFrame>
        <AuthFormSkeleton />
      </AuthPageFrame>
    ),
  },
);

export default function ResetPasswordPage(): React.ReactElement {
  return (
    <Suspense
      fallback={
        <AuthPageFrame>
          <AuthFormSkeleton />
        </AuthPageFrame>
      }
    >
      <ResetPasswordScreen />
    </Suspense>
  );
}
