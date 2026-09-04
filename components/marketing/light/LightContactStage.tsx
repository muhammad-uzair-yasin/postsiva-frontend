"use client";

import { LightContactForm } from "@/components/marketing/contact/LightContactForm";
import { LightContactSidebar } from "@/components/marketing/contact/LightContactSidebar";
import { lightSectionClass } from "@/components/marketing/light/light-layout";
import { cn } from "@/lib/cn";

export function LightContactStage(): React.ReactElement {
  return (
    <section data-landing-contact className={cn("py-10", lightSectionClass)}>
      <div className="mb-8 text-center">
        <h2 className="font-[family-name:var(--font-headline)] text-4xl font-bold tracking-tight text-[#111827] sm:text-5xl">
          Get in Touch
        </h2>
        <p className="mx-auto mt-3 max-w-2xl text-base leading-relaxed text-[#667085]">
          Questions about features, trials, pricing, demos, or partnerships? Send a message and
          we&apos;ll help you find the right path.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <LightContactForm />
        </div>
        <div className="lg:col-span-5">
          <LightContactSidebar />
        </div>
      </div>
    </section>
  );
}
