/**
 * Strong-password policy shared by signup, reset-password, setup-password
 * and accept-invite forms. Mirrors the backend policy in
 * postsiva-backend/app/utils/password_policy.py.
 */

export const PASSWORD_MIN_LENGTH = 8;

export const PASSWORD_POLICY_HINT =
  "Min 8 characters with uppercase, lowercase, number and special character";

export function getPasswordPolicyError(password: string): string | null {
  const missing: string[] = [];
  if (password.length < PASSWORD_MIN_LENGTH) {
    missing.push(`at least ${PASSWORD_MIN_LENGTH} characters`);
  }
  if (!/[A-Z]/.test(password)) missing.push("an uppercase letter");
  if (!/[a-z]/.test(password)) missing.push("a lowercase letter");
  if (!/\d/.test(password)) missing.push("a number");
  if (!/[^A-Za-z0-9]/.test(password)) missing.push("a special character");
  if (missing.length === 0) return null;
  return `Password must contain ${missing.join(", ")}.`;
}
