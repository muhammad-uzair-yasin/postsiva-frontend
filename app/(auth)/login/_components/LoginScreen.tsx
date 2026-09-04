import { Suspense } from "react";

import { AuthPageFrame } from "@/app/(auth)/_components/AuthPageFrame";
import { AuthSideVisual } from "@/app/(auth)/_components/AuthSideVisual";

import { LoginFormPanel } from "./LoginFormPanel";
import { LoginQueryMessages } from "./LoginQueryMessages";

export function LoginScreen(): React.ReactElement {
  return (
    <AuthPageFrame>
      <Suspense fallback={null}>
        <LoginQueryMessages />
      </Suspense>
      <div className="flex min-h-screen w-full flex-col items-stretch lg:flex-row">
        <AuthSideVisual />
        <LoginFormPanel />
      </div>
    </AuthPageFrame>
  );
}
