"use client";

import Link from "next/link";

function StepCard({
  step,
  icon,
  title,
  children,
}: {
  step: number;
  icon: string;
  title: string;
  children: React.ReactNode;
}): React.ReactElement {
  return (
    <li className="flex gap-3 rounded-xl border border-[#E5E7EB] bg-white p-4 shadow-sm">
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#EFF6FF] text-sm font-bold text-[#0058bc]">
        {step}
      </span>
      <div className="min-w-0 flex-1">
        <p className="flex items-center gap-2 text-sm font-semibold text-[#111827]">
          <span
            className="material-symbols-outlined shrink-0 text-[20px] leading-none text-[#0058bc]"
            aria-hidden
          >
            {icon}
          </span>
          <span className="min-w-0">{title}</span>
        </p>
        <p className="mt-2 text-sm leading-relaxed text-[#4B5563]">{children}</p>
      </div>
    </li>
  );
}

function SectionBlock({
  icon,
  title,
  subtitle,
  children,
}: {
  icon: string;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}): React.ReactElement {
  return (
    <section className="min-w-0 rounded-2xl border border-[#E5E7EB] bg-white p-5 sm:p-6">
      <div className="flex items-start gap-3">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-[#EFF6FF] text-[#0058bc]">
          <span
            className="material-symbols-outlined text-[26px] leading-none"
            aria-hidden
          >
            {icon}
          </span>
        </span>
        <div className="min-w-0 flex-1">
          <h2 className="text-lg font-bold tracking-tight text-[#111827] sm:text-xl">{title}</h2>
          {subtitle ? (
            <p className="mt-1 text-sm leading-snug text-[#4B5563]">{subtitle}</p>
          ) : null}
        </div>
      </div>
      <div className="mt-5 min-w-0">{children}</div>
    </section>
  );
}

interface WordPressSelfHostedHelpContentProps {
  /** Tighter spacing when shown inside the connect flow modal. */
  compact?: boolean;
}

/** Publer-style guide: manual Application Password connect for self-hosted WordPress. */
export function WordPressSelfHostedHelpContent({
  compact = false,
}: WordPressSelfHostedHelpContentProps): React.ReactElement {
  const outerClass = compact
    ? "min-w-0 text-[#111827]"
    : "mx-auto max-w-4xl px-4 pb-20 pt-8 text-[#111827] sm:px-6";

  return (
    <article className={outerClass}>
      <div className="rounded-xl border border-[#BFDBFE] bg-[#EFF6FF] px-4 py-3 sm:flex sm:items-center sm:gap-3">
        <span className="material-symbols-outlined hidden text-[#0058bc] sm:block">admin_panel_settings</span>
        <p className="text-sm leading-relaxed text-[#4B5563]">
          Only a WordPress <strong className="text-[#111827]">Administrator</strong> can connect a
          self-hosted site. If you are not an admin, ask your site owner to complete these steps.
        </p>
      </div>

      <div
        className={`grid min-w-0 grid-cols-1 gap-6 md:grid-cols-2 md:items-start ${compact ? "mt-5" : "mt-8"}`}
      >
        <SectionBlock
          icon="language"
          title="On your WordPress site"
          subtitle="Create an Application Password once — reuse it here in PostSiva."
        >
          <ol className="flex flex-col gap-3">
            <StepCard step={1} icon="verified_user" title="Check requirements">
              Your site must run <strong className="text-[#111827]">WordPress 5.6+</strong> over{" "}
              <strong className="text-[#111827]">HTTPS</strong>.
            </StepCard>
            <StepCard step={2} icon="person" title="Open Application Passwords">
              Go to <strong className="text-[#111827]">Users → Profile</strong> and scroll to{" "}
              <strong className="text-[#111827]">Application Passwords</strong>.
            </StepCard>
            <StepCard step={3} icon="add_circle" title="Create a new password">
              Name it <strong className="text-[#111827]">Postsiva</strong>, then click{" "}
              <strong className="text-[#111827]">Add New Application Password</strong>.
            </StepCard>
            <StepCard step={4} icon="key" title="Copy the password">
              WordPress shows the password once. Copy it to a password manager — it is{" "}
              <em>not</em> your normal login password.
            </StepCard>
          </ol>
        </SectionBlock>

        <SectionBlock
          icon="link"
          title="In PostSiva"
          subtitle="Paste the credentials in the Self Hosted connect form."
        >
          <ol className="flex flex-col gap-3">
            <StepCard step={1} icon="hub" title="Open connect">
              <strong className="text-[#111827]">Connect accounts</strong> →{" "}
              <strong className="text-[#111827]">WordPress</strong> →{" "}
              <strong className="text-[#111827]">Self Hosted</strong>.
            </StepCard>
            <StepCard step={2} icon="language" title="Site URL">
              Enter your full URL, e.g.{" "}
              <code className="rounded bg-[#EFF6FF] px-1.5 py-0.5 text-xs text-[#111827]">
                https://www.example.com
              </code>
              .
            </StepCard>
            <StepCard step={3} icon="badge" title="Login">
              Use the <strong className="text-[#111827]">email or username</strong> from your
              WordPress profile.
            </StepCard>
            <StepCard step={4} icon="vpn_key" title="Application password">
              Paste the password you copied from WordPress, then click{" "}
              <strong className="text-[#111827]">Add</strong>.
            </StepCard>
          </ol>
        </SectionBlock>
      </div>

      <div className={`mt-5 ${compact ? "" : "mt-8"}`}>
        <SectionBlock
          icon="help_center"
          title="If connection fails"
          subtitle="Most issues are a wrong paste, blocked REST API, or using WordPress.com hosting."
        >
        <ul className="grid gap-2 sm:grid-cols-2">
          {[
            "Paste the application password again with no extra spaces.",
            "Use the same email or username as on your WordPress profile.",
            "Remove the legacy Application Passwords plugin (built into WP 5.6+).",
            "Allow the WordPress REST API (/wp-json/) — security plugins often block it.",
            "WordPress.com hosted sites: use Hosted on WordPress.com, not Self Hosted.",
          ].map((line) => (
            <li
              key={line}
              className="flex gap-2 rounded-lg border border-[#E5E7EB] bg-white px-3 py-2.5 text-sm text-[#4B5563]"
            >
              <span className="material-symbols-outlined shrink-0 text-[18px] text-[#0058bc]">
                check_circle
              </span>
              <span>{line}</span>
            </li>
          ))}
        </ul>
        <p className="mt-4 text-sm text-[#4B5563]">
          <Link href="/contact" className="font-semibold text-[#0058bc] hover:underline">
            Contact support
          </Link>{" "}
          if you still cannot connect.
        </p>
      </SectionBlock>
      </div>
    </article>
  );
}
