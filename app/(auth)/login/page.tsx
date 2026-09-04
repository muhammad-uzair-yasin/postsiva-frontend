import type { Metadata } from "next";
import dynamic from "next/dynamic";
import { Suspense } from "react";

import { AuthFormSkeleton } from "@/components/auth/AuthFormSkeleton";
import { AuthenticatedAuthPageGate } from "@/lib/auth/AuthSessionGate";

export const metadata: Metadata = {
  title: "Login | Postsiva Command Center",
  description: "Sign in to the Postsiva command center.",
};

const LoginScreen = dynamic(
  () =>
    import("./_components/LoginScreen").then((m) => ({
      default: m.LoginScreen,
    })),
  { loading: () => <AuthFormSkeleton /> },
);

export default function LoginPage(): React.ReactElement {
  return (
    <AuthenticatedAuthPageGate>
      <Suspense fallback={<AuthFormSkeleton />}>
        <LoginScreen />
      </Suspense>
    </AuthenticatedAuthPageGate>
  );
}
