import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/auth-context";
import { NotificationPrompt } from "@/components/notifications/notification-prompt";
import { NotificationInitializer } from "@/components/notifications/notification-initializer";
import { NotificationTestButton } from "@/components/notifications/notification-test-button";
import { NotificationDebugPanel } from "@/components/notifications/notification-debug-panel";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "CODE 4O4 Dev Club · Build, Learn, Grow",
  description:
    "An immersive developer club experience powered by Firebase, collaborative projects, live events, and a gamified member portal.",
  metadataBase: new URL("https://devclub.preview"),
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "NST Dev Club",
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    type: "website",
    siteName: "NST Dev Club",
    title: "CODE 4O4 Dev Club",
    description:
      "Build, Learn, and Grow with the NST Software Development Club",
  },
  twitter: {
    card: "summary",
    title: "CODE 4O4 Dev Club",
    description:
      "Build, Learn, and Grow with the NST Software Development Club",
  },
};

export const viewport: Viewport = {
  themeColor: "#06b6d4",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/icon-192x192.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AuthProvider>
          {children}
          <NotificationPrompt />
          <NotificationInitializer />
          <NotificationTestButton />
          <NotificationDebugPanel />
        </AuthProvider>
      </body>
    </html>
  );
}
