"use client";

import { NotificationTestButton } from "./notification-test-button";
import { NotificationDebugPanel } from "./notification-debug-panel";

export default function NotificationDebugWrapper() {
  // Use the NEXT_PUBLIC_VERCEL_ENV env var which Vercel sets for preview builds.
  // In local dev, NODE_ENV !== 'production' so this will also show.
  const isPreviewOrDev =
    process.env.NEXT_PUBLIC_VERCEL_ENV === "preview" ||
    process.env.NODE_ENV !== "production";

  if (!isPreviewOrDev) return null;

  return (
    <>
      <NotificationTestButton />
      <NotificationDebugPanel />
    </>
  );
}
