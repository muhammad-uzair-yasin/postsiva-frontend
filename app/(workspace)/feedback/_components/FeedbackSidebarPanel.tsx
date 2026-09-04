"use client";

import { useTranslations } from "@/lib/i18n/WorkspaceLocaleProvider";

import { FEEDBACK_DEMO_REQUESTS } from "../_data/feedbackDemoRequests";
import type { FeedbackRequestStatus } from "../_data/feedbackDemoRequests";

const DEMO_REQUEST_I18N: Record<
  string,
  { title: string; updated: string }
> = {
  "#PS-842": {
    title: "feedback.demoPs842Title",
    updated: "feedback.demoPs842Updated",
  },
  "#PS-791": {
    title: "feedback.demoPs791Title",
    updated: "feedback.demoPs791Updated",
  },
  "#PS-612": {
    title: "feedback.demoPs612Title",
    updated: "feedback.demoPs612Updated",
  },
};

function statusBadgeClasses(
  status: FeedbackRequestStatus,
  t: (key: string) => string,
): { label: string; className: string } {
  if (status === "planned") {
    return {
      label: t("feedback.statusPlanned"),
      className:
        "rounded-full bg-secondary-container/10 px-2 py-1 text-[10px] font-bold uppercase tracking-widest text-secondary-fixed-dim",
    };
  }
  if (status === "under_review") {
    return {
      label: t("feedback.statusUnderReview"),
      className:
        "rounded-full bg-primary-container/20 px-2 py-1 text-[10px] font-bold uppercase tracking-widest text-primary-fixed-dim",
    };
  }
  return {
    label: t("feedback.statusCompleted"),
    className:
      "rounded-full bg-emerald-400/10 px-2 py-1 text-[10px] font-bold uppercase tracking-widest text-emerald-400",
  };
}

export function FeedbackSidebarPanel(): React.ReactElement {
  const { t } = useTranslations();

  return (
    <aside className="space-y-8 lg:col-span-4">
      <div className="rounded-2xl border border-outline-variant/10 bg-surface-container p-6">
        <div className="mb-8 flex items-center justify-between">
          <h2 className="text-lg font-bold text-on-surface">
            {t("feedback.sidebarRequestStatus")}
          </h2>
          <span className="rounded-md bg-secondary-container/10 px-2 py-1 text-xs font-bold text-secondary-fixed-dim">
            {t("feedback.sidebarActive")}
          </span>
        </div>
        <div className="divide-y divide-outline-variant/10">
          {FEEDBACK_DEMO_REQUESTS.map((req) => {
            const badge = statusBadgeClasses(req.status, t);
            const copy = DEMO_REQUEST_I18N[req.ticketId];
            return (
              <button
                key={req.ticketId}
                type="button"
                className="group w-full cursor-pointer py-6 text-left first:pt-0 last:pb-0"
              >
                <div className="mb-2 flex items-start justify-between">
                  <span className="rounded-md bg-surface-container-high px-2 py-1 text-xs font-bold text-on-surface-variant">
                    {req.ticketId}
                  </span>
                  <span className={badge.className}>{badge.label}</span>
                </div>
                <h4 className="text-sm font-semibold text-on-surface transition-colors group-hover:text-primary">
                  {copy ? t(copy.title) : req.title}
                </h4>
                <p className="mt-1 text-xs text-on-surface-variant">
                  {copy ? t(copy.updated) : req.updatedLabel}
                </p>
              </button>
            );
          })}
        </div>
        <button
          type="button"
          className="mt-8 w-full rounded-xl border border-outline-variant/10 bg-surface-container-high py-3 text-xs font-bold uppercase tracking-widest text-on-surface-variant transition-colors hover:bg-surface-container-highest"
        >
          {t("feedback.viewAllRequests")}
        </button>
      </div>

      <div className="relative overflow-hidden rounded-2xl border border-primary-container/20 bg-gradient-to-br from-primary-container/20 to-transparent p-6">
        <div className="relative z-10">
          <h3 className="mb-2 font-bold text-on-surface">{t("feedback.communityTitle")}</h3>
          <p className="text-xs leading-relaxed text-on-surface-variant">
            {t("feedback.communityBody")}
          </p>
          <div className="mt-4 flex -space-x-2">
            <img
              alt=""
              className="h-8 w-8 rounded-full border-2 border-surface object-cover"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuDf9iohPqAPGYkrOoqBz73IhKnoJNSRPk6GG__NKmjjbMDMLaHh_n6IY7f4A8DByf5AAnl89JNW6yckLY2qdlIl6cKqf3OU1iHH36v2nfuFlYRN78bZKVz1CR9mJUFUWcI5vkbBZCTrsEenpSeEkerneU_Oiv-Pemwz4CPhXDCdvvGd2GobamB_-mLQvgt3-HBewsGo-QeAp6iOArQNhcprkTBvxGjrkKHiTIk8MCS5KHm73OdmTFKl_lAjLeb3zJobQkI3KaHzb-JY"
            />
            <img
              alt=""
              className="h-8 w-8 rounded-full border-2 border-surface object-cover"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuDGSXYctlyUPCSVeub3lVbtFPBj0Fn5zETSbA6Ma5CpzrUNk9GvpfX2BBkCV9Uq4O1t3PpS8-gyC-_Hny0oHNDHEZWeJT01H-AW3a-DfY5R4xg7RUFdaWCNNRJx88Y8Nwbug3YBN-vsaeludP6jnhetVGyErXqo9EPK10JcN83ZT6aMzjtDaXKwZpwb54RXf4BuESrdFSlL5t7riM1WZEGPR32P1MZFL5O7HrCvWXgk08UNlDVOD6asWEuzIgrajznDIoqIdDPr-jRS"
            />
            <img
              alt=""
              className="h-8 w-8 rounded-full border-2 border-surface object-cover"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuAI3iUtnhyvjWq7x95MHJde4JBLexcdncURx6SRgfCYBjYrNbL86NY-sZwQXiUjI-7b6yKC5hYRNegDO3S0CMuFzXubs_51yrED9HrPyPd6UpdUmSq9OECzIzFMOzZ2ifmBZVwYAxMWiU1R66GxovYCpO0ibbAfDfROye0GFYf8P06sqtbxxB96nvGKw50RTOy_yBD44Fk5wKRKt6gasu1e44WawA9gjMGZHuTSGf4IBhjICDmYVsHDqWj1oTq-S4i_xjl-3VKu5lI2"
            />
            <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-surface bg-surface-container-highest text-[10px] font-bold">
              +2k
            </div>
          </div>
        </div>
        <div className="absolute -bottom-10 -right-10 h-32 w-32 rounded-full bg-primary/20 blur-3xl" />
      </div>
    </aside>
  );
}
