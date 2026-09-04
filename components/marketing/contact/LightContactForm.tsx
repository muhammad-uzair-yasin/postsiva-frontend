"use client";

import { ArrowRight, ChevronDown } from "lucide-react";
import { useState } from "react";

import { helpGlassCard } from "@/components/help/helpGlassCard";
import { CONTACT_WEBHOOK } from "@/components/marketing/nav-config";
import { cn } from "@/lib/cn";

const SUBJECT_OPTIONS = [
  "General Inquiry",
  "Sales & Pricing",
  "Technical Support",
  "Partnerships",
] as const;

type SubjectOption = (typeof SUBJECT_OPTIONS)[number];

interface ContactFormState {
  firstName: string;
  lastName: string;
  email: string;
  subject: SubjectOption;
  message: string;
}

const EMPTY_FORM: ContactFormState = {
  firstName: "",
  lastName: "",
  email: "",
  subject: "General Inquiry",
  message: "",
};

const inputWrap =
  "rounded-lg border border-[#94a3b8] bg-white transition-all duration-200 focus-within:border-[#111827] focus-within:shadow-[0_0_0_1px_#111827]";

const inputClass =
  "w-full border-none bg-transparent px-4 py-3 text-base text-[#111827] outline-none placeholder:text-[#94a3b8] focus:ring-0";

export function LightContactForm(): React.ReactElement {
  const [form, setForm] = useState<ContactFormState>(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch(CONTACT_WEBHOOK, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          source: "Unified Postsiva Contact Form",
          date: new Date().toISOString(),
        }),
      });
      if (res.ok) {
        setDone(true);
        setForm(EMPTY_FORM);
      }
    } catch {
      /* silent — same as legacy contact form */
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <div
        className={cn(
          helpGlassCard,
          "rounded-2xl bg-white p-8 shadow-[0_24px_60px_rgba(15,23,42,0.12)] md:p-12",
        )}
      >
        <h2 className="mb-8 font-[family-name:var(--font-headline)] text-2xl font-semibold text-[#111827] sm:text-[2rem]">
          Send us a message
        </h2>

        <form className="space-y-6" onSubmit={(event) => void onSubmit(event)}>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <label
                htmlFor="contact-first-name"
                className="block font-mono text-xs font-bold uppercase tracking-wider text-[#111827]"
              >
                First Name
              </label>
              <div className={inputWrap}>
                <input
                  id="contact-first-name"
                  required
                  autoComplete="given-name"
                  placeholder="Jane"
                  className={inputClass}
                  value={form.firstName}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, firstName: event.target.value }))
                  }
                />
              </div>
            </div>
            <div className="space-y-2">
              <label
                htmlFor="contact-last-name"
                className="block font-mono text-xs font-bold uppercase tracking-wider text-[#111827]"
              >
                Last Name
              </label>
              <div className={inputWrap}>
                <input
                  id="contact-last-name"
                  required
                  autoComplete="family-name"
                  placeholder="Doe"
                  className={inputClass}
                  value={form.lastName}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, lastName: event.target.value }))
                  }
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label
              htmlFor="contact-email"
              className="block font-mono text-xs font-bold uppercase tracking-wider text-[#111827]"
            >
              Work Email
            </label>
            <div className={inputWrap}>
              <input
                id="contact-email"
                type="email"
                required
                autoComplete="email"
                placeholder="jane@company.com"
                className={inputClass}
                value={form.email}
                onChange={(event) =>
                  setForm((current) => ({ ...current, email: event.target.value }))
                }
              />
            </div>
          </div>

          <div className="space-y-2">
            <label
              htmlFor="contact-subject"
              className="block font-mono text-xs font-bold uppercase tracking-wider text-[#111827]"
            >
              Subject
            </label>
            <div className={cn(inputWrap, "relative")}>
              <select
                id="contact-subject"
                className={cn(inputClass, "appearance-none pr-10")}
                value={form.subject}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    subject: event.target.value as SubjectOption,
                  }))
                }
              >
                {SUBJECT_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
              <ChevronDown
                className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#475467]"
                aria-hidden
              />
            </div>
          </div>

          <div className="space-y-2">
            <label
              htmlFor="contact-message"
              className="block font-mono text-xs font-bold uppercase tracking-wider text-[#111827]"
            >
              Message
            </label>
            <div className={inputWrap}>
              <textarea
                id="contact-message"
                required
                rows={4}
                placeholder="How can we help you?"
                className={cn(inputClass, "resize-none")}
                value={form.message}
                onChange={(event) =>
                  setForm((current) => ({ ...current, message: event.target.value }))
                }
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-6 py-4 text-base font-medium text-on-primary transition-all duration-200 hover:bg-[#004a9e] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
          >
            <span>{submitting ? "Sending…" : "Send Message"}</span>
            {!submitting ? <ArrowRight className="h-4 w-4" aria-hidden /> : null}
          </button>
        </form>
      </div>

      {done ? (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-on-surface/40 px-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-label="Message sent"
        >
          <div className="relative w-full max-w-sm rounded-2xl border border-outline-variant/50 bg-surface-container-lowest p-8 text-center shadow-xl">
            <span className="material-symbols-outlined text-5xl text-primary" aria-hidden>
              check_circle
            </span>
            <p className="mt-4 text-lg font-semibold text-on-surface">Message sent</p>
            <p className="mt-2 text-sm text-on-surface-variant">
              Thanks for reaching out — we&apos;ll get back to you soon.
            </p>
            <button
              type="button"
              className="mt-6 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-on-primary"
              onClick={() => setDone(false)}
            >
              Close
            </button>
          </div>
        </div>
      ) : null}
    </>
  );
}
