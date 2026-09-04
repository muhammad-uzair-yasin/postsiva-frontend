"use client";

import { GoogleSignInButton } from "@/app/(auth)/_components/GoogleSignInButton";
import { LinkedInSignInButton } from "@/app/(auth)/_components/LinkedInSignInButton";
import { MicrosoftSignInButton } from "@/app/(auth)/_components/MicrosoftSignInButton";
import { FacebookSignInButton } from "@/app/(auth)/_components/FacebookSignInButton";
import { TikTokSignInButton } from "@/app/(auth)/_components/TikTokSignInButton";

export function SocialLoginButtons(): React.ReactElement {
  return (
    <div className="flex flex-col gap-3">
      <GoogleSignInButton />
      <LinkedInSignInButton />
      <MicrosoftSignInButton />
      <FacebookSignInButton />
      <TikTokSignInButton />
    </div>
  );
}
