import type { Metadata } from "next";
import dynamic from "next/dynamic";
import { Suspense } from "react";

import { AuthFormSkeleton } from "@/components/auth/AuthFormSkeleton";
import { AuthenticatedAuthPageGate } from "@/lib/auth/AuthSessionGate";

export const metadata: Metadata = {
  title: "Sign Up | Postsiva",
  description: "Create your Postsiva account.",
};

const SignupScreen = dynamic(
  () =>
    import("./_components/SignupScreen").then((m) => ({
      default: m.SignupScreen,
    })),
  { loading: () => <AuthFormSkeleton /> },
);

export default function SignupPage(): React.ReactElement {
  return (
    <AuthenticatedAuthPageGate>
      <Suspense fallback={<AuthFormSkeleton />}>
        <SignupScreen />
      </Suspense>
    </AuthenticatedAuthPageGate>
  );
}
