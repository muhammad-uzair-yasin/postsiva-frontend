import Link from "next/link";

import {
  MARKETING_INTEGRATION_GROUPS,
  MARKETING_INTEGRATIONS,
} from "@/lib/marketing/integrationsCatalog";

export function LightIntegrationsPage(): React.ReactElement {
  return (
    <main className="bg-white">
      <section className="border-b border-[#E5E7EB] bg-[#F8FBFF] px-4 pb-16 pt-28 sm:px-10 lg:pt-32">
        <div className="mx-auto grid max-w-[1280px] gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-end">
          <div>
            <p className="font-mono text-xs font-semibold uppercase tracking-[0.22em] text-[#0058bc]">
              Integrations
            </p>
            <h1 className="mt-3 max-w-2xl font-[family-name:var(--font-headline)] text-4xl font-semibold tracking-tight text-[#111827] sm:text-5xl">
              Connect every channel your workflow depends on.
            </h1>
            <p className="mt-5 max-w-xl text-base leading-7 text-[#4B5563]">
              Browse Postsiva social networks, creative sources, cloud storage, and automation
              connections. Each card opens the matching setup guide or API documentation.
            </p>
          </div>
          <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 lg:grid-cols-5">
            {MARKETING_INTEGRATIONS.slice(0, 15).map((item) => (
              <div
                key={item.id}
                className="flex aspect-square items-center justify-center rounded-2xl border border-[#D7E7FF] bg-white shadow-sm"
              >
                <img src={item.src} alt="" className="h-8 w-8 object-contain" />
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 py-16 sm:px-10 sm:py-20">
        <div className="mx-auto max-w-[1280px] space-y-16">
          {MARKETING_INTEGRATION_GROUPS.map((group) => {
            const items = MARKETING_INTEGRATIONS.filter((item) => item.group === group);
            return (
              <div key={group}>
                <div className="mb-6 flex items-end justify-between gap-4">
                  <div>
                    <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.18em] text-[#0058bc]">
                      {group}
                    </p>
                    <h2 className="mt-2 font-[family-name:var(--font-headline)] text-2xl font-semibold text-[#111827]">
                      {items.length} integrations
                    </h2>
                  </div>
                  <Link
                    href="/help"
                    className="hidden text-sm font-semibold text-[#0058bc] hover:underline sm:inline"
                  >
                    Help center
                  </Link>
                </div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {items.map((item) => {
                    const external = item.href.startsWith("http");
                    const card = (
                      <>
                        <div className="flex items-start justify-between gap-4">
                          <span className="flex h-12 w-12 items-center justify-center rounded-xl border border-[#BFDBFE] bg-white p-2.5 shadow-sm">
                            <img src={item.src} alt="" className="h-full w-full object-contain" />
                          </span>
                          <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-[#6B7280]">
                            Guide
                          </span>
                        </div>
                        <h3 className="mt-5 text-base font-bold text-[#111827] group-hover:text-[#0058bc]">
                          {item.label}
                        </h3>
                        <p className="mt-2 text-sm leading-6 text-[#4B5563]">
                          {item.description}
                        </p>
                      </>
                    );
                    const className =
                      "group flex min-h-[14rem] flex-col rounded-xl border border-[#E5E7EB] bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-[#0058bc]/35 hover:shadow-[0_18px_40px_rgba(0,88,188,0.08)]";

                    return external ? (
                      <a
                        key={item.id}
                        href={item.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={className}
                      >
                        {card}
                      </a>
                    ) : (
                      <Link key={item.id} href={item.href} className={className}>
                        {card}
                      </Link>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </main>
  );
}
