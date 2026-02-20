import type { Metadata } from "next";
import { fraunces } from "@/app/fonts";
import "@/app/globals.css";

export const metadata: Metadata = {
  title: "Simple Meditations",
  description: "Meditate without hassle.",
  manifest: "/manifest.webmanifest",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head >
        <link rel="manifest" href="/manifest.webmanifest" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-title" content="Simple Meditations" />
        <meta name="apple-mobile-web-app-status-bar-style" content="white" />
        <link rel="apple-touch-icon" sizes="180x180" href="/icons/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/icons/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="192x192" href="/icons/android-chrome-192x192.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/icons/favicon-16x16.png" />
        <link rel="mask-icon" href="/icons/safari-pinned-tab.svg" color="#fcd34d" />
        <meta name="apple-mobile-web-app-title" content="Meditations" />
        <meta name="application-name" content="Meditations" />
        <meta name="msapplication-TileColor" content="#fde68a" />
        <meta name="msapplication-TileImage" content="/icons/mstile-144x144.png" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body className={fraunces.className}>{children}</body>
    </html>
  );
}
