"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useCallback, useEffect, useState } from "react";

import { AuthFormSkeleton } from "@/components/auth/AuthFormSkeleton";
import { PublicLanguageSwitcher } from "@/components/i18n/PublicLanguageSwitcher";
import { getApiBaseUrl } from "@/lib/api/config";
import { getPasswordPolicyError } from "@/lib/auth/passwordPolicy";
import { usePublicTranslations } from "@/lib/i18n/PublicLocaleProvider";

interface Preview {
  workspace_name: string;
  email: string;
  account_exists: boolean;
  role_name: string;
  expires_at: string;
}

function AcceptInviteInner(): React.ReactElement {
  const { t } = usePublicTranslations();
  const token = useSearchParams().get("token");
  const [preview, setPreview] = useState<Preview | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState<string | null>(null);
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [fullName, setFullName] = useState("");
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const loadPreview = useCallback(async () => {
    if (!token) {
      setLoadError(t("auth.missingInviteToken"));
      return;
    }
    setLoadError(null);
    try {
      const res = await fetch(
        `${getApiBaseUrl()}/workspace-invites/preview?token=${encodeURIComponent(token)}`,
        { method: "GET", headers: { Accept: "application/json" } },
      );
      const raw: unknown = await res.json().catch(() => null);
      if (!res.ok) {
        const msg =
          typeof raw === "object" && raw !== null && "detail" in raw
            ? String((raw as { detail: unknown }).detail)
            : "Invalid or expired invitation";
        setLoadError(msg);
        return;
      }
      setPreview(raw as Preview);
    } catch {
      setLoadError("Could not load invitation.");
    }
  }, [token, t]);

  useEffect(() => {
    void loadPreview();
  }, [loadPreview]);

  async function onAccept(e: React.FormEvent): Promise<void> {
    e.preventDefault();
    if (!token) return;
    setSubmitError(null);
    if (preview && !preview.account_exists) {
      const passwordError = getPasswordPolicyError(password);
      if (passwordError) {
        setSubmitError(passwordError);
        return;
      }
    }
    setBusy(true);
    try {
      const body: Record<string, unknown> = { token };
      if (preview && !preview.account_exists) {
        body.password = password;
        body.username = username.trim();
        body.full_name = fullName.trim();
      }
      const res = await fetch(`${getApiBaseUrl()}/workspace-invites/accept`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(body),
      });
      const raw: unknown = await res.json().catch(() => null);
      if (!res.ok) {
        const msg =
          typeof raw === "object" && raw !== null && "detail" in raw
            ? String((raw as { detail: unknown }).detail)
            : "Could not accept invitation";
        setSubmitError(msg);
        return;
      }
      const data = raw as { message?: string };
      setDone(data.message ?? "You're in.");
    } finally {
      setBusy(false);
    }
  }

  if (!token) {
    return (
      <div className="relative mx-auto max-w-md px-4 py-16 text-center text-on-surface-variant">
        <div className="absolute right-4 top-4">
          <PublicLanguageSwitcher compact />
        </div>
        <p>{t("auth.missingInviteToken")}</p>
        <Link href="/login" className="mt-4 inline-block text-primary underline">
          {t("auth.login")}
        </Link>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="relative mx-auto max-w-md px-4 py-16 text-center">
        <div className="absolute right-4 top-4">
          <PublicLanguageSwitcher compact />
        </div>
        <p className="text-error">{loadError}</p>
        <Link href="/login" className="mt-4 inline-block text-primary underline">
          {t("auth.login")}
        </Link>
      </div>
    );
  }

  if (!preview) {
    return (
      <div className="mx-auto max-w-md px-4 py-16 text-center text-on-surface-variant">
        {t("auth.loadingInvite")}
      </div>
    );
  }

  if (done) {
    return (
      <div className="mx-auto max-w-md space-y-4 px-4 py-16 text-center">
        <p className="text-on-surface">{done}</p>
        <Link
          href="/login"
          className="inline-flex rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground"
        >
          {t("auth.logInPostsiva")}
        </Link>
      </div>
    );
  }

  return (
    <div className="relative mx-auto max-w-md space-y-6 px-4 py-16">
      <div className="absolute right-4 top-4">
        <PublicLanguageSwitcher compact />
      </div>
      <div className="text-center">
        <h1 className="text-xl font-bold text-on-surface">
          {t("auth.joinNamed", { name: preview.workspace_name })}
        </h1>
        <p className="mt-2 text-sm text-on-surface-variant">
          {t("auth.roleLabel")}:{" "}
          <span className="font-medium text-on-surface">{preview.role_name}</span> ·{" "}
          {preview.email}
        </p>
      </div>

      {preview.account_exists ? (
        <form onSubmit={onAccept} className="space-y-4">
          <p className="text-sm text-on-surface-variant">{t("auth.acceptInviteExisting")}</p>
          {submitError ? <p className="text-sm text-error">{submitError}</p> : null}
          <button
            type="submit"
            disabled={busy}
            className="w-full rounded-full bg-primary py-3 text-sm font-semibold text-primary-foreground disabled:opacity-50"
          >
            {busy ? t("auth.working") : t("auth.acceptInvitation")}
          </button>
        </form>
      ) : (
        <form onSubmit={onAccept} className="space-y-4">
          <label className="block text-left text-sm">
            <span className="text-on-surface-variant">{t("auth.fullName")}</span>
            <input
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="mt-1 w-full rounded-xl border border-outline-variant bg-surface px-3 py-2 text-on-surface"
            />
          </label>
          <label className="block text-left text-sm">
            <span className="text-on-surface-variant">{t("auth.username")}</span>
            <input
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="mt-1 w-full rounded-xl border border-outline-variant bg-surface px-3 py-2 text-on-surface"
            />
          </label>
          <label className="block text-left text-sm">
            <span className="text-on-surface-variant">{t("auth.passwordMin8")}</span>
            <div className="relative mt-1">
              <input
                required
                type={showPassword ? "text" : "password"}
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={busy}
                autoComplete="new-password"
                className="w-full rounded-xl border border-outline-variant bg-surface py-2 pl-3 pr-12 text-on-surface"
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-on-surface-variant transition-colors hover:text-on-surface disabled:opacity-50"
                onClick={() => {
                  setShowPassword((v) => !v);
                }}
                disabled={busy}
                aria-pressed={showPassword}
              >
                <span className="material-symbols-outlined text-xl leading-none">
                  {showPassword ? "visibility_off" : "visibility"}
                </span>
              </button>
            </div>
          </label>
          {submitError ? <p className="text-sm text-error">{submitError}</p> : null}
          <button
            type="submit"
            disabled={busy}
            className="w-full rounded-full bg-primary py-3 text-sm font-semibold text-primary-foreground disabled:opacity-50"
          >
            {busy ? t("auth.creatingAccount") : t("auth.createAccountJoin")}
          </button>
        </form>
      )}
    </div>
  );
}

export default function AcceptInvitePage(): React.ReactElement {
  return (
    <Suspense fallback={<AuthFormSkeleton />}>
      <AcceptInviteInner />
    </Suspense>
  );
}
