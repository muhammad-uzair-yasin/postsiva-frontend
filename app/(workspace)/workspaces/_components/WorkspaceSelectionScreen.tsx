"use client";

import { motion } from "framer-motion";

import { useTranslations } from "@/lib/i18n/WorkspaceLocaleProvider";
import { AccountShell } from "@/app/(account)/account/_components/AccountShell";

import { WorkspacePageDocumentHead } from "../../_components/WorkspacePageDocumentHead";
import { WorkspaceStitchGrid } from "./WorkspaceStitchGrid";

export function WorkspaceSelectionScreen(): React.ReactElement {
  const { t } = useTranslations();

  return (
    <AccountShell>
      <WorkspacePageDocumentHead
        titleKey="workspaces.metaTitle"
        descriptionKey="workspaces.metaDescription"
      />
      <motion.header
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        className="mb-8 sm:mb-10"
      >
        <p className="mb-2 text-xs font-bold uppercase tracking-widest text-secondary">
          {t("workspaces.eyebrow")}
        </p>
        <h1 className="font-headline text-2xl font-extrabold tracking-tight text-on-surface sm:text-3xl">
          {t("workspaces.title")}
        </h1>
        <p className="mt-3 max-w-xl text-base text-on-surface-variant">
          {t("workspaces.subtitle")}
        </p>
      </motion.header>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.06, ease: [0.22, 1, 0.36, 1] }}
      >
        <WorkspaceStitchGrid />
      </motion.div>
    </AccountShell>
  );
}
