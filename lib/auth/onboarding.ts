import type { AuthUser } from "./types";

/** Next onboarding step after login/signup/Google, or null when complete. */
export function getOnboardingPath(user: AuthUser | null | undefined): string | null {
  if (!user) {
    return null;
  }
  if (user.must_set_password) {
    return "/setup-password";
  }
  if (!user.email_verified) {
    return "/verify-otp";
  }
  return null;
}

export function isOnboardingComplete(user: AuthUser | null | undefined): boolean {
  return getOnboardingPath(user) === null;
}
