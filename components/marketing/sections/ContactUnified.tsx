"use client";

import { CONTACT_WEBHOOK } from "@/components/marketing/nav-config";
import { MARKETING_PIVA_VIDEO_SRC } from "@/components/marketing/marketingMedia";
import { usePublicTranslations } from "@/lib/i18n/PublicLocaleProvider";
import { motion } from "framer-motion";
import { CheckCircle2, Lock, Mail, MessageSquare, RefreshCw, Send, X } from "lucide-react";
import { useState } from "react";

interface FormState {
  firstName: string;
  lastName: string;
  email: string;
  message: string;
}

const empty: FormState = {
  firstName: "",
  lastName: "",
  email: "",
  message: "",
};

const CONTACT_PIVA_VIDEO_SRC = MARKETING_PIVA_VIDEO_SRC;

export function ContactUnified(): React.ReactElement {
  const { t } = usePublicTranslations();
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [form, setForm] = useState<FormState>(empty);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>): Promise<void> {
    e.preventDefault();
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
        setForm(empty);
      }
    } catch {
      /* handled silently — same pattern as LinkedIn marketing form */
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section id="contact" className="relative scroll-mt-28 overflow-hidden py-24">
      <div className="marketing-container">
        <div className="grid items-start gap-10 lg:grid-cols-2 lg:gap-14">
          <motion.div
            initial={{ opacity: 0, x: -18 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <p className="text-xs font-bold uppercase tracking-widest text-secondary">
              {t("marketing.contactEyebrow")}
            </p>
            <h2 className="mt-4 text-3xl font-extrabold text-on-surface sm:text-4xl">
              {t("marketing.contactHeadline")}
            </h2>
            <p className="mt-4 text-on-surface-variant">{t("marketing.contactLead")}</p>
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
              className="group relative mt-6 w-full max-w-lg sm:mt-7"
            >
              <div
                className="absolute -inset-0.5 rounded-[1.25rem] bg-gradient-to-br from-primary/35 via-transparent to-secondary/30 opacity-70 blur-lg transition-opacity duration-500 group-hover:opacity-90 sm:blur-xl"
                aria-hidden
              />
              <div className="relative overflow-hidden rounded-3xl border border-white/12 bg-surface-container-low/90 shadow-[0_28px_80px_-36px_rgba(0,0,0,0.9)] ring-1 ring-white/[0.06] transition-transform duration-300 group-hover:ring-primary/20 sm:group-hover:scale-[1.01]">
                <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_0%,rgba(107,73,216,0.12),transparent_55%)]" />
                <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_70%_50%_at_80%_100%,rgba(84,220,191,0.08),transparent_50%)]" />
                <div className="relative w-full p-0.5 sm:p-1">
                  <div className="relative aspect-video w-full overflow-hidden rounded-xl border border-white/[0.07] bg-[#05070c] shadow-inner shadow-black/40 sm:aspect-[16/10] sm:rounded-2xl">
                    <video
                      className="h-full w-full object-cover object-center"
                      autoPlay
                      muted
                      loop
                      playsInline
                      preload="auto"
                      aria-label={t("marketing.contactVideoAria")}
                    >
                      <source src={CONTACT_PIVA_VIDEO_SRC} type="video/mp4" />
                    </video>
                  </div>
                </div>
              </div>
            </motion.div>
            <p className="mt-2 max-w-lg text-xs leading-relaxed text-on-surface-variant sm:mt-2.5">
              {t("marketing.contactFootnote")}
            </p>
            <div className="mt-5 space-y-5 sm:mt-6">
              <div className="flex gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/15 text-primary">
                  <Mail className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
                    {t("marketing.contactEmailLabel")}
                  </p>
                  <a
                    href="mailto:support@postsiva.com"
                    className="text-sm font-bold text-on-surface hover:text-primary"
                  >
                    support@postsiva.com
                  </a>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/15 text-primary">
                  <MessageSquare className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
                    {t("marketing.contactResponseLabel")}
                  </p>
                  <p className="text-sm font-semibold text-on-surface">
                    {t("marketing.contactResponseBody")}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 18 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="relative w-full overflow-hidden rounded-3xl border border-white/10 bg-surface-container/90 p-7 shadow-[0_24px_80px_-32px_rgba(0,0,0,0.75)] ring-1 ring-white/[0.04] backdrop-blur-xl sm:p-8"
          >
            <div className="pointer-events-none absolute -right-24 -top-24 h-48 w-48 rounded-full bg-primary/15 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-20 -left-16 h-40 w-40 rounded-full bg-secondary/10 blur-3xl" />
            <div className="relative z-[1]">
              <p className="text-xs font-black uppercase tracking-[0.22em] text-secondary">
                {t("marketing.contactFormEyebrow")}
              </p>
              <p className="mt-2 text-sm text-on-surface-variant">
                {t("marketing.contactFormHint")}
              </p>
            </div>
            <form
              className="relative z-[1] mt-6 flex flex-col gap-5"
              onSubmit={(e) => void onSubmit(e)}
            >
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block text-xs font-bold text-on-surface-variant">
                  <span className="mb-2 block">{t("marketing.contactFirstName")}</span>
                  <input
                    required
                    autoComplete="given-name"
                    className="w-full rounded-xl border border-white/10 bg-surface-container-lowest/90 px-3.5 py-3 text-sm text-on-surface shadow-inner shadow-black/20 outline-none transition duration-200 hover:border-white/[0.16] focus:border-primary/40 focus:ring-2 focus:ring-primary/25"
                    value={form.firstName}
                    onChange={(e) => setForm((f) => ({ ...f, firstName: e.target.value }))}
                  />
                </label>
                <label className="block text-xs font-bold text-on-surface-variant">
                  <span className="mb-2 block">{t("marketing.contactLastName")}</span>
                  <input
                    required
                    autoComplete="family-name"
                    className="w-full rounded-xl border border-white/10 bg-surface-container-lowest/90 px-3.5 py-3 text-sm text-on-surface shadow-inner shadow-black/20 outline-none transition duration-200 hover:border-white/[0.16] focus:border-primary/40 focus:ring-2 focus:ring-primary/25"
                    value={form.lastName}
                    onChange={(e) => setForm((f) => ({ ...f, lastName: e.target.value }))}
                  />
                </label>
              </div>
              <label className="block text-xs font-bold text-on-surface-variant">
                <span className="mb-2 block">{t("marketing.contactWorkEmail")}</span>
                <input
                  required
                  type="email"
                  autoComplete="email"
                  className="w-full rounded-xl border border-white/10 bg-surface-container-lowest/90 px-3.5 py-3 text-sm text-on-surface shadow-inner shadow-black/20 outline-none transition duration-200 hover:border-white/[0.16] focus:border-primary/40 focus:ring-2 focus:ring-primary/25"
                  value={form.email}
                  onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                />
              </label>
              <label className="block text-xs font-bold text-on-surface-variant">
                <span className="mb-2 block">{t("marketing.contactMessageLabel")}</span>
                <textarea
                  required
                  rows={5}
                  className="min-h-[8.5rem] w-full resize-y rounded-xl border border-white/10 bg-surface-container-lowest/90 px-3.5 py-3 text-sm leading-relaxed text-on-surface shadow-inner shadow-black/20 outline-none transition duration-200 hover:border-white/[0.16] focus:border-primary/40 focus:ring-2 focus:ring-primary/25"
                  value={form.message}
                  onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
                />
              </label>
              <button
                type="submit"
                disabled={submitting}
                className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-primary to-secondary py-3.5 text-sm font-bold text-on-primary shadow-lg shadow-primary/25 transition hover:shadow-xl hover:shadow-primary/30 disabled:cursor-not-allowed disabled:opacity-55 disabled:shadow-none sm:hover:scale-[1.01] sm:active:scale-[0.99]"
              >
                {submitting ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    {t("marketing.contactSending")}
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4" />
                    {t("marketing.contactSend")}
                  </>
                )}
              </button>
            </form>
            <p className="relative z-[1] mt-6 flex items-start gap-2 border-t border-white/[0.06] pt-5 text-xs leading-relaxed text-on-surface-variant">
              <Lock className="mt-0.5 h-3.5 w-3.5 shrink-0 text-secondary" aria-hidden />
              <span>{t("marketing.contactPrivacyNote")}</span>
            </p>
          </motion.div>
        </div>
      </div>

      {done ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 px-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-label={t("marketing.contactDialogAria")}
        >
          <div className="relative mx-4 w-full max-w-sm rounded-3xl border border-white/10 bg-surface-container p-6 text-center shadow-2xl sm:mx-0">
            <button
              type="button"
              className="absolute right-3 top-3 text-on-surface-variant hover:text-on-surface"
              onClick={() => setDone(false)}
              aria-label={t("marketing.contactClose")}
            >
              <X className="h-5 w-5" />
            </button>
            <CheckCircle2 className="mx-auto h-12 w-12 text-secondary" />
            <p className="mt-4 text-lg font-bold text-on-surface">
              {t("marketing.contactSuccessTitle")}
            </p>
            <p className="mt-2 text-sm text-on-surface-variant">
              {t("marketing.contactSuccessBody")}
            </p>
            <button
              type="button"
              className="mt-6 rounded-full bg-white/10 px-5 py-2 text-sm font-semibold text-on-surface"
              onClick={() => setDone(false)}
            >
              {t("marketing.contactClose")}
            </button>
          </div>
        </motion.div>
      ) : null}
    </section>
  );
}
