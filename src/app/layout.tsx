import type { Metadata, Viewport } from "next";
import "./globals.css";
import SwRegister from "@/components/sw-register";
import { AuthProvider } from "@/context/auth-context";
import LenisProvider from "@/components/lenis-provider";

export const metadata: Metadata = {
  title: "DevForge · Build, Learn, Grow",
  description:
    "An immersive developer experience powered by Firebase, collaborative projects, live events, and a gamified member portal.",
  metadataBase: new URL("https://devforge.preview"),
  manifest: "/manifest.json",
  icons: {
    icon: "/icon.png",
    apple: "/icon.png",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "DevForge",
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    type: "website",
    siteName: "DevForge",
    title: "DevForge · Build, Learn, Grow",
    description:
      "Build, Learn, and Grow with DevForge",
    images: [{ url: "/icon.png", width: 512, height: 512 }],
  },
  twitter: {
    card: "summary",
    title: "DevForge",
    description:
      "Build, Learn, and Grow with DevForge",
    images: ["/icon.png"],
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
        <meta name="apple-mobile-web-app-title" content="DevForge" />
        {}
        <link rel="manifest" href="/manifest.json" />
        <link rel="icon" type="image/png" href="/icon.png" />
        <link rel="apple-touch-icon" href="/icon.png" />
        <meta name="theme-color" content="#06b6d4" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body className="antialiased">
        <AuthProvider>
          {}
          {}
          {}
          {}
          <script suppressHydrationWarning={true} />
          {}
          {}
          {
            
          }
          <SwRegister />
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
