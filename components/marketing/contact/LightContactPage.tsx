"use client";

import { LightContactForm } from "@/components/marketing/contact/LightContactForm";
import { LightContactSidebar } from "@/components/marketing/contact/LightContactSidebar";

export function LightContactPage(): React.ReactElement {
  return (
    <main className="mx-auto w-full max-w-[1280px] flex-grow px-4 pb-24 pt-24 sm:px-10 sm:pt-32">
      <div className="mb-16 text-center md:mb-24">
        <h1 className="mb-6 font-[family-name:var(--font-headline)] text-4xl font-bold tracking-tight text-[#111827] sm:text-5xl lg:text-[3rem] lg:leading-[1.15]">
          Get in Touch
        </h1>
        <p className="mx-auto max-w-2xl text-base font-medium leading-relaxed text-[#475467]">
          Whether you have a question about features, trials, pricing, need a demo, or anything
          else, our team is ready to answer all your questions.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-6">
        <div className="lg:col-span-7">
          <LightContactForm />
        </div>
        <div className="lg:col-span-5">
          <LightContactSidebar />
        </div>
      </div>
    </main>
  );
}
