"use client";

import { AuthOnboardingGate } from "@/lib/auth/AuthSessionGate";
import { AuthPageFrame } from "@/app/(auth)/_components/AuthPageFrame";

import { VerifyOtpFormPanel } from "./VerifyOtpFormPanel";
import { VerifyOtpHero } from "./VerifyOtpHero";

export function VerifyOtpScreen(): React.ReactElement {
  return (
    <AuthOnboardingGate requiredPath="/verify-otp">
      <AuthPageFrame>
        <div className="flex min-h-0 flex-1 flex-col items-stretch lg:flex-row">
          <VerifyOtpHero />
          <VerifyOtpFormPanel />
        </div>
      </AuthPageFrame>
    </AuthOnboardingGate>
  );
}
