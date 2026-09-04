"use client";

import { usePathname } from "next/navigation";
import type { ReactElement } from "react";

import { GatedNavLink } from "@/components/billing/GatedNavLink";
import { useBilling } from "@/lib/billing/BillingContext";
import {
  isBillingNavLocked,
  settingsNavBillingFeature,
} from "@/lib/billing/featureGates";

import {
  isSettingsNavActive,
  type SettingsNavGroup,
  type SettingsNavItem,
} from "../_data/settingsNav";
import { useSettingsNavGroups } from "../_hooks/useSettingsNavGroups";
import { useTranslations } from "@/lib/i18n/WorkspaceLocaleProvider";

function NavGroupBlock(props: {
  readonly group: SettingsNavGroup;
  readonly pathname: string;
  readonly items: readonly SettingsNavItem[];
  readonly features: Record<string, boolean> | undefined;
  readonly loading: boolean;
}): ReactElement {
  const { group, pathname, items, features, loading } = props;

  return (
    <div className="space-y-1.5">
      <p className="px-1 text-[10px] font-bold uppercase tracking-[0.12em] text-on-surface-variant/90">
        {group.title}
      </p>
      <ul className="space-y-0.5" role="list">
        {items.map((item) => {
          const active = isSettingsNavActive(pathname, item.href);
          const requiredFeature = settingsNavBillingFeature(item.href);
          const locked = isBillingNavLocked(requiredFeature, features, loading);

          return (
            <li key={item.href}>
              <GatedNavLink
                href={item.href}
                locked={locked}
                className={`flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                  active && !locked
                    ? "bg-primary-container/40 font-bold text-on-primary-container shadow-sm ring-1 ring-primary/20"
                    : "text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface"
                }`}
              >
                <span>{item.label}</span>
              </GatedNavLink>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export function SettingsNavSidebar(): ReactElement {
  const pathname = usePathname();
  const { usage, loading } = useBilling();
  const navGroups = useSettingsNavGroups();
  const { t } = useTranslations();

  return (
    <nav
      className="rounded-2xl border border-outline-variant/15 bg-surface-container-low/80 p-4 shadow-sm backdrop-blur-sm md:p-5"
      aria-label={t("settings.sections")}
    >
      <div className="flex flex-col gap-8">
        {navGroups.map((group) => (
          <NavGroupBlock
            key={group.id}
            group={group}
            pathname={pathname}
            items={group.items}
            features={usage?.features}
            loading={loading}
          />
        ))}
      </div>
    </nav>
  );
}
