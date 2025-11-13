"use client";

import { useState } from "react";
import { Bell } from "lucide-react";

/**
 * Notification test button - for debugging
 * Shows if browser notifications are working
 */
export function NotificationTestButton() {
  const [testing, setTesting] = useState(false);

    const testNotification = async () => {
    if (!("Notification" in window)) {
      alert("This browser does not support notifications");
      return;
    }

    if (Notification.permission !== "granted") {
      alert("Please enable notifications first");
      return;
    }

    const notificationOptions = {
      body: "This is a test notification from NST Dev Club! 🎉",
      icon: "/icon-192x192.svg",
      badge: "/icon-72x72.svg",
      tag: "test-notification",
      requireInteraction: false,
    };

    try {
      // Try direct Notification API first (works on iOS)
      new Notification("Test Notification", notificationOptions);
    } catch (error) {
      // Fallback to Service Worker API (required for Android)
      console.log("Falling back to Service Worker notification:", error);
      try {
        const registration = await navigator.serviceWorker.getRegistration();
        if (registration) {
          await registration.showNotification("Test Notification", notificationOptions);
        } else {
          alert("Service Worker not registered. Please refresh the page.");
        }
      } catch (swError) {
        console.error("Service Worker notification failed:", swError);
        alert("Failed to show notification. Please check console.");
      }
    }
  };

  return (
    <button
      onClick={testNotification}
      disabled={testing}
      className="fixed bottom-4 left-4 z-50 bg-purple-600 hover:bg-purple-700 text-white rounded-full p-4 shadow-lg transition-all disabled:opacity-50"
      title="Test Notification"
    >
      <Bell className="w-6 h-6" />
    </button>
  );
}
