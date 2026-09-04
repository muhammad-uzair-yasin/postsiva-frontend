"use client";

import { useSignupForm } from "../_hooks/useSignupForm";

import { SignupEmailFormFields } from "./SignupEmailFormFields";

export function SignupEmailForm(): React.ReactElement {
  const form = useSignupForm();

  return (
    <form className="space-y-5" onSubmit={form.onSubmit} noValidate>
      {form.error ? (
        <p
          className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
          role="alert"
        >
          {form.error}
        </p>
      ) : null}
      <SignupEmailFormFields
        firstName={form.firstName}
        setFirstName={form.setFirstName}
        email={form.email}
        setEmail={form.setEmail}
        password={form.password}
        setPassword={form.setPassword}
        termsAccepted={form.termsAccepted}
        setTermsAccepted={form.setTermsAccepted}
        isLoading={form.isLoading}
      />
    </form>
  );
}
