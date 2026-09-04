import type { Metadata } from "next";
import { PublicLocaleBoundary } from "@/components/i18n/PublicLocaleBoundary";
import { MaterialSymbolsLink } from "@/components/fonts/MaterialSymbolsLink";

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
  },
};

/** Auth screens stay light — landing assistant lives on marketing home only. */
export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <PublicLocaleBoundary>
      <MaterialSymbolsLink />
      <div className="flex min-h-full flex-col">{children}</div>
    </PublicLocaleBoundary>
  );
}
