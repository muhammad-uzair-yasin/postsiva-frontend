import type { Metadata } from "next";

import { AdminChrome } from "./_components/AdminChrome";

export const metadata: Metadata = {
  title: "Postsiva Admin",
  robots: { index: false, follow: false },
};

export default function AdminLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return <AdminChrome>{children}</AdminChrome>;
}
