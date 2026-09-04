import { AuthPageFrame } from "@/app/(auth)/_components/AuthPageFrame";
import { AuthSideVisual } from "@/app/(auth)/_components/AuthSideVisual";

import { SignupFormPanel } from "./SignupFormPanel";

export function SignupScreen(): React.ReactElement {
  return (
    <AuthPageFrame>
      <div className="flex min-h-screen w-full flex-col items-stretch lg:flex-row">
        <AuthSideVisual />
        <SignupFormPanel />
      </div>
    </AuthPageFrame>
  );
}
