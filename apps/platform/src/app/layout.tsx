import type { Metadata } from "next";
import type { PropsWithChildren } from "react";

import Link from "next/link";

import { getSeoConfig } from "@ultra/modules";

import "./globals.css";

import { ThemeToggle } from "../components/theme-toggle";
import { ThemeProvider } from "../components/theme-provider";
import { startPlatformBackgroundRuntime } from "../server/background-runtime";

const seoConfig = getSeoConfig();

if (process.env.NEXT_PHASE !== "phase-production-build") {
  startPlatformBackgroundRuntime();
}

export const metadata: Metadata = {
  metadataBase: new URL(seoConfig.siteUrl),
  title: {
    default: seoConfig.defaultMetadata.title,
    template: seoConfig.titleTemplate,
  },
  description: seoConfig.defaultMetadata.description,
  keywords: seoConfig.defaultMetadata.keywords,
  alternates: {
    canonical: seoConfig.defaultMetadata.canonicalPath,
    languages: Object.fromEntries(
      seoConfig.locales.map((locale) => [locale, seoConfig.defaultMetadata.canonicalPath]),
    ),
  },
  robots: {
    index: seoConfig.defaultMetadata.robots.index,
    follow: seoConfig.defaultMetadata.robots.follow,
    googleBot: {
      index: seoConfig.defaultMetadata.robots.googleBot.index,
      follow: seoConfig.defaultMetadata.robots.googleBot.follow,
      "max-video-preview": seoConfig.defaultMetadata.robots.googleBot.maxVideoPreview,
      "max-image-preview": seoConfig.defaultMetadata.robots.googleBot.maxImagePreview,
      "max-snippet": seoConfig.defaultMetadata.robots.googleBot.maxSnippet,
    },
  },
  openGraph: {
    type: "website",
    siteName: seoConfig.siteName,
    title: seoConfig.defaultMetadata.openGraph.title,
    description: seoConfig.defaultMetadata.openGraph.description,
    images: seoConfig.defaultMetadata.openGraph.images,
    url: seoConfig.defaultMetadata.canonicalPath,
  },
  twitter: {
    card: seoConfig.defaultMetadata.twitter.card,
    title: seoConfig.defaultMetadata.twitter.title,
    description: seoConfig.defaultMetadata.twitter.description,
    images: [seoConfig.defaultMetadata.twitter.image],
  },
  verification: {
    google: seoConfig.verification.google,
    yandex: seoConfig.verification.yandex,
  },
};

export default function RootLayout({ children }: PropsWithChildren) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider>
          <div className="site-nav">
            <div>
              <strong>Ultra Commerce</strong>
              <p>Modular Next.js commerce platform</p>
            </div>
            <nav>
              <Link href="/">Overview</Link>
              <Link href="/admin">Admin</Link>
              <Link href="/docs">Docs</Link>
              <Link href="/api/openapi">OpenAPI</Link>
            </nav>
            <ThemeToggle />
          </div>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
