import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/auth-context";
import { NotificationPrompt } from "@/components/notifications/notification-prompt";
import { NotificationInitializer } from "@/components/notifications/notification-initializer";

import NotificationDebugWrapper from "@/components/notifications/notification-debug-wrapper";

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
  icons: {
    icon: [
      { url: "/icon-192x192.svg", type: "image/svg+xml", sizes: "192x192" },
      { url: "/icon-512x512.svg", type: "image/svg+xml", sizes: "512x512" },
    ],
    apple: [
      { url: "/icon-192x192.svg", sizes: "192x192", type: "image/svg+xml" },
    ],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "CODE 4O4",
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    type: "website",
    siteName: "CODE 4O4 Dev Club",
    title: "CODE 4O4 Dev Club · Build, Learn, Grow",
    description:
      "Build, Learn, and Grow with the NST Software Development Club",
    images: [{ url: "/icon-512x512.svg", width: 512, height: 512 }],
  },
  twitter: {
    card: "summary",
    title: "CODE 4O4 Dev Club",
    description:
      "Build, Learn, and Grow with the NST Software Development Club",
    images: ["/icon-512x512.svg"],
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#06b6d4" },
    { media: "(prefers-color-scheme: dark)", color: "#06b6d4" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="CODE 4O4" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AuthProvider>
          {children}
          <NotificationPrompt />
          <NotificationInitializer />
          <NotificationDebugWrapper />
        </AuthProvider>
      </body>
    </html>
  );
}
