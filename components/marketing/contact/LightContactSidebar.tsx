"use client";

import { ArrowUpRight } from "lucide-react";

export function LightContactSidebar(): React.ReactElement {
  return (
    <div className="flex flex-col space-y-8">
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
        <ContactInfoCard
          icon="support_agent"
          title="Technical Support"
          body="Need help with Postsiva? Send us your question and our team will follow up."
          email="info@postsiva.com"
        />
        <ContactInfoCard
          icon="point_of_sale"
          title="Sales & Enterprise"
          body="Discuss custom plans and enterprise integrations."
          email="info@postsiva.com"
        />
      </div>

      <div className="flex flex-grow items-start gap-4 rounded-2xl border border-[#cbd5e1] bg-white p-7 shadow-[0_24px_60px_rgba(15,23,42,0.12)]">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#eaf3ff] text-[#0058bc]">
          <span className="material-symbols-outlined" aria-hidden>
            corporate_fare
          </span>
        </div>
        <div>
          <h3 className="mb-2 text-lg font-bold text-[#111827]">Postsiva</h3>
          <p className="text-sm font-medium leading-relaxed text-[#111827]">
            Mountain Road Place Northeast
            <br />
            Albuquerque, NM 87110
            <br />
            USA
          </p>
          <div className="mt-4 space-y-2 text-sm font-semibold text-[#111827]">
            <a className="block hover:underline" href="tel:+923157349862">
              +92 315 7349862
            </a>
            <a className="block hover:underline" href="mailto:info@postsiva.com">
              info@postsiva.com
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

function ContactInfoCard({
  icon,
  title,
  body,
  email,
}: {
  icon: string;
  title: string;
  body: string;
  email: string;
}): React.ReactElement {
  return (
    <div className="flex flex-col rounded-2xl border border-[#cbd5e1] bg-white p-6 shadow-[0_24px_60px_rgba(15,23,42,0.12)] transition-colors hover:border-[#111827]/40">
      <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-[#eaf3ff] text-[#0058bc]">
        <span className="material-symbols-outlined" aria-hidden>
          {icon}
        </span>
      </div>
      <h3 className="mb-2 font-bold text-[#111827]">{title}</h3>
      <p className="mb-4 flex-grow text-sm font-medium text-[#111827]">{body}</p>
      <a
        href={`mailto:${email}`}
        className="inline-flex items-center gap-1 text-sm font-bold text-[#111827] hover:underline"
      >
        <span>{email}</span>
        <ArrowUpRight className="h-4 w-4" aria-hidden />
      </a>
    </div>
  );
}
