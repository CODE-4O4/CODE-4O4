"use client";

import { useEffect } from "react";
import { useAuth } from "@/context/auth-context";
import { onForegroundMessage } from "@/lib/notifications";

/**
 * Initialize Firebase Cloud Messaging
 * - Registers service worker for background notifications
 * - Listens for foreground messages and shows browser notifications
 */
export function NotificationInitializer() {
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;
    if (typeof window === "undefined") return;
    if (!("serviceWorker" in navigator)) {
      console.warn("Service Worker not supported in this browser");
      return;
    }

    // Register service worker for background notifications
    const registerServiceWorker = async () => {
      try {
        console.log("📱 Registering service worker for notifications...");
        const registration = await navigator.serviceWorker.register(
          "/firebase-messaging-sw.js"
        );
        console.log("✅ Service Worker registered:", registration);
      } catch (error) {
        console.error("❌ Service Worker registration failed:", error);
      }
    };

    registerServiceWorker();

    // Listen for foreground messages (when app is open)
    console.log("👂 Setting up foreground message listener...");
    const unsubscribe = onForegroundMessage(async (payload) => {
      console.log("📬 Foreground notification received:", payload);

      // Show browser notification even when app is in foreground
      if (Notification.permission === "granted") {
        const notificationTitle = payload.notification?.title || "New Notification";
        const notificationOptions: NotificationOptions = {
          body: payload.notification?.body || "",
          icon: payload.notification?.icon || "/icon-192x192.png",
          badge: "/icon-192x192.png",
          tag: payload.data?.type || "general",
          data: payload.data,
        };

        // Try using the Notification constructor. Some Android contexts (webviews/embedded browsers)
        // disallow the constructor and require the ServiceWorkerRegistration.showNotification() API.
        try {
          // @ts-ignore - some environments provide a different Notification implementation
          new Notification(notificationTitle, notificationOptions);
        } catch (err) {
          console.warn("Notification constructor failed, falling back to service worker showNotification:", err);
          try {
            const reg = await navigator.serviceWorker.getRegistration();
            if (reg) {
              reg.showNotification(notificationTitle, notificationOptions as any);
            } else {
              console.error("No service worker registration available to show notification");
            }
          } catch (swErr) {
            console.error("Failed to show notification via service worker:", swErr);
          }
        }
      }
    });

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [user]);

  return null; // This component doesn't render anything
}
