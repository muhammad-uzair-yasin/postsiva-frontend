import type { LucideIcon } from "lucide-react";

type MegaMenuIconProps = {
  icon: LucideIcon;
};

/** Soft icon well used in Features / Made for mega menus. */
export function MegaMenuIcon({ icon: Icon }: MegaMenuIconProps): React.ReactElement {
  return (
    <span
      className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] border border-white/10 bg-white/[0.05] text-on-surface/85 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] transition-colors group-hover:border-primary/30 group-hover:bg-primary/12 group-hover:text-primary"
      aria-hidden
    >
      <Icon className="h-[18px] w-[18px]" strokeWidth={2} absoluteStrokeWidth />
    </span>
  );
}
