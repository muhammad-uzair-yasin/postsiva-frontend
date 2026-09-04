import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Manrope } from "next/font/google";
import "./globals.css";

import { MaterialSymbolsLink } from "@/components/fonts/MaterialSymbolsLink";
import {
  DEFAULT_PUBLIC_DESCRIPTION,
  HOME_TITLE,
} from "@/lib/seo/publicPageMeta";
import { getSiteUrl } from "@/lib/site/getSiteUrl";
import { DEFAULT_THEME } from "@/lib/theme/themeConstants";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
  display: "swap",
});

/** Explicit viewport avoids inconsistent mobile/tablet initial scale across browsers. */
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  metadataBase: new URL(getSiteUrl()),
  title: {
    default: HOME_TITLE,
    template: "%s | Postsiva",
  },
  description: DEFAULT_PUBLIC_DESCRIPTION,
  icons: {
    icon: [
      { url: "/favicon/favicon.ico", sizes: "any" },
      { url: "/favicon/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      {
        url: "/favicon/android-chrome-192x192.png",
        sizes: "192x192",
        type: "image/png",
      },
    ],
    shortcut: [{ url: "/favicon/favicon.ico" }],
    apple: [
      {
        url: "/favicon/apple-touch-icon.png",
        sizes: "180x180",
        type: "image/png",
      },
    ],
    other: [{ rel: "manifest", url: "/favicon/site.webmanifest" }],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${manrope.variable} h-full antialiased`}
      data-theme={DEFAULT_THEME}
      suppressHydrationWarning
    >
      <head>
        <MaterialSymbolsLink />
      </head>
      <body className="app-viewport flex min-h-full min-w-0 flex-col">
        {children}
      </body>
    </html>
  );
}
