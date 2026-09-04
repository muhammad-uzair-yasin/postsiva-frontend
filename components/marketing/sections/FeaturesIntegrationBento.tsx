"use client";

import { fadeUp, staggerContainer } from "@/components/marketing/motion-variants";
import { usePublicTranslations } from "@/lib/i18n/PublicLocaleProvider";
import { OPENAI_ICON_SRC } from "@/lib/social/openaiIconSrc";
import { motion } from "framer-motion";
import { Smartphone, type LucideIcon } from "lucide-react";

const WHATSAPP_ICON = "https://cdn.simpleicons.org/whatsapp/25D366";
const OPENAI_ICON = OPENAI_ICON_SRC;
const MCP_ICON =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'%3E%3Crect width='64' height='64' rx='14' fill='%231a1f2e'/%3E%3Ctext x='32' y='40' text-anchor='middle' font-family='system-ui,sans-serif' font-size='18' font-weight='700' fill='%23e8ecf4'%3EMCP%3C/text%3E%3C/svg%3E";

type EdgeItem = {
  title: string;
  tag: string;
  body: string;
  brandSrc?: string;
  Icon?: LucideIcon;
  accent: string;
  href: string;
};

export function FeaturesIntegrationBento(): React.ReactElement {
  const { t } = usePublicTranslations();

  const edges: readonly EdgeItem[] = [
    {
      title: t("marketing.bentoWhatsappTitle"),
      tag: t("marketing.bentoWhatsappTag"),
      body: t("marketing.bentoWhatsappBody"),
      brandSrc: WHATSAPP_ICON,
      accent: "border-[#25D366]/25 bg-[#25D366]/10",
      href: "/#whatsapp",
    },
    {
      title: t("marketing.bentoMobileTitle"),
      tag: t("marketing.bentoMobileTag"),
      body: t("marketing.bentoMobileBody"),
      Icon: Smartphone,
      accent: "border-primary/25 bg-primary/10",
      href: "/#mobile-app",
    },
    {
      title: t("marketing.bentoGptTitle"),
      tag: t("marketing.bentoGptTag"),
      body: t("marketing.bentoGptBody"),
      brandSrc: OPENAI_ICON,
      accent: "border-white/15 bg-white/[0.06]",
      href: "/#postsiva-gpt",
    },
    {
      title: t("marketing.bentoMcpTitle"),
      tag: t("marketing.bentoMcpTag"),
      body: t("marketing.bentoMcpBody"),
      brandSrc: MCP_ICON,
      accent: "border-secondary/30 bg-secondary/10",
      href: "/#postsiva-gpt",
    },
  ];

  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-50px" }}
      variants={staggerContainer}
      className="mt-10"
    >
      <motion.p
        variants={fadeUp}
        custom={0}
        className="mb-5 text-[11px] font-bold uppercase tracking-[0.22em] text-on-surface-variant/75"
      >
        {t("marketing.featuresEdgesLabel")}
      </motion.p>

      <div className="grid gap-4 lg:grid-cols-2">
        {edges.map((item, i) => {
          const Icon = item.Icon;
          return (
            <motion.a
              key={item.title}
              href={item.href}
              variants={fadeUp}
              custom={i + 1}
              className="group relative flex flex-col overflow-hidden rounded-2xl border border-white/10 bg-surface-container-lowest/50 p-5 transition-[border-color,background-color,transform] duration-300 hover:-translate-y-1 hover:border-white/18 hover:bg-surface-container-low/70 sm:p-6"
            >
              <div className="flex flex-1 flex-col gap-3">
                <div className="flex items-start gap-3.5">
                  <span
                    className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border ${item.accent}`}
                    aria-hidden
                  >
                    {item.brandSrc ? (
                      <img
                        src={item.brandSrc}
                        alt=""
                        className="h-5 w-5 object-contain"
                        loading="lazy"
                        decoding="async"
                      />
                    ) : Icon ? (
                      <Icon className="h-5 w-5 text-primary" strokeWidth={2} />
                    ) : null}
                  </span>
                  <div className="min-w-0 pt-0.5">
                    <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-secondary/90">
                      {item.tag}
                    </span>
                    <h3 className="mt-1 text-lg font-bold tracking-tight text-on-surface">
                      {item.title}
                    </h3>
                  </div>
                </div>
                <p className="text-sm leading-relaxed text-on-surface-variant">
                  {item.body}
                </p>
              </div>
            </motion.a>
          );
        })}
      </div>
    </motion.div>
  );
}
