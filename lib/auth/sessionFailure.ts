export function shouldRedirectToLogin(
  status: number,
  errorCode?: string | null,
): boolean {
  return status === 510 || errorCode?.toUpperCase() === "TOKEN_EXPIRED";
}
