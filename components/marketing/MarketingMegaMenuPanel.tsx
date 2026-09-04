"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";

import type { MegaMenuColumn } from "@/lib/marketing/megaMenuData";
import { cn } from "@/lib/cn";

type MarketingMegaMenuPanelProps = {
  readonly columns: readonly MegaMenuColumn[];
  readonly onNavigate?: () => void;
  readonly className?: string;
  readonly footerHref?: string;
  readonly footerLabel?: string;
};

function MegaMenuColumnBlock({
  column,
  onNavigate,
  bordered,
}: {
  column: MegaMenuColumn;
  onNavigate?: () => void;
  bordered: boolean;
}): React.ReactElement {
  const Icon = column.icon;
  return (
    <div
      className={cn(
        "flex min-w-0 flex-1 flex-col px-6 py-8 sm:px-8 sm:py-9",
        bordered && "border-t border-white/10 md:border-t-0 md:border-l",
      )}
    >
      <div className="mb-6 flex items-center gap-3">
        <span
          className="flex h-10 w-10 shrink-0 items-center justify-center text-white/90"
          aria-hidden
        >
          <Icon className="h-[26px] w-[26px]" strokeWidth={1.75} />
        </span>
        <p className="font-[family-name:var(--font-headline)] text-lg font-bold leading-tight text-white">
          {column.title}
        </p>
      </div>
      <ul className="flex flex-col gap-3">
        {column.links.map((link) => (
          <li key={link.label + link.href}>
            <Link
              href={link.href}
              onClick={onNavigate}
              className="group inline-flex items-center gap-2.5 text-[15px] font-medium leading-snug text-slate-300 transition-colors hover:text-white"
            >
              {link.iconSrc ? (
                <img
                  src={link.iconSrc}
                  alt=""
                  className="h-5 w-5 shrink-0 object-contain"
                  loading="lazy"
                  decoding="async"
                />
              ) : null}
              <span>{link.label}</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function MarketingMegaMenuPanel({
  columns,
  onNavigate,
  className,
  footerHref,
  footerLabel,
}: MarketingMegaMenuPanelProps): React.ReactElement {
  return (
    <div className={className}>
      <div className="flex flex-col md:flex-row md:items-stretch">
        {columns.map((column, index) => (
          <MegaMenuColumnBlock
            key={column.title}
            column={column}
            onNavigate={onNavigate}
            bordered={index > 0}
          />
        ))}
      </div>
      {footerHref && footerLabel ? (
        <div className="border-t border-white/10 px-6 py-4 sm:px-8">
          <Link
            href={footerHref}
            onClick={onNavigate}
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-white/80 transition-colors hover:text-white"
          >
            {footerLabel}
            <ArrowRight className="h-3.5 w-3.5" aria-hidden />
          </Link>
        </div>
      ) : null}
    </div>
  );
}
