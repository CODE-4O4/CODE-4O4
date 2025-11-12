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
    setTesting(true);
    
    try {
      // Check if notifications are supported
      if (!("Notification" in window)) {
        alert("This browser doesn't support notifications");
        return;
      }

      // Check permission
      console.log("Current permission:", Notification.permission);
      
      if (Notification.permission === "granted") {
        // Show test notification
        console.log("🔔 Showing test notification...");
        const notification = new Notification("🧪 Test Notification", {
          body: "If you see this, notifications are working! 🎉",
          icon: "/icon-192x192.png",
          badge: "/icon-192x192.png",
          tag: "test",
          requireInteraction: false,
          silent: false,
        });

        notification.onclick = () => {
          console.log("Notification clicked!");
          notification.close();
        };

        setTimeout(() => notification.close(), 5000);
      } else if (Notification.permission === "denied") {
        alert("Notifications are blocked. Please enable them in your browser settings:\n\n1. Click the lock icon in the address bar\n2. Find Notifications\n3. Change to Allow");
      } else {
        // Request permission
        console.log("Requesting permission...");
        const permission = await Notification.requestPermission();
        console.log("Permission result:", permission);
        
        if (permission === "granted") {
          new Notification("🎉 Notifications Enabled!", {
            body: "You'll now receive updates from CODE 404 Dev Club",
            icon: "/icon-192x192.png",
          });
        }
      }
    } catch (error) {
      console.error("Error testing notification:", error);
      alert("Error: " + (error instanceof Error ? error.message : String(error)));
    } finally {
      setTesting(false);
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
