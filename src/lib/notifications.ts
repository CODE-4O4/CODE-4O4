import { getFirebaseMessaging } from "./firebase/client";
import { getToken, onMessage, type MessagePayload } from "firebase/messaging";

export interface NotificationPayload {
  title: string;
  body: string;
  icon?: string;
  data?: Record<string, string>;
  url?: string;
}

/**
 * Request notification permission from the user
 * @returns Promise<boolean> - true if permission granted
 */
export async function requestNotificationPermission(): Promise<boolean> {
  if (typeof window === "undefined") return false;
  
  if (!("Notification" in window)) {
    console.error("This browser does not support notifications");
    return false;
  }

  try {
    const permission = await Notification.requestPermission();
    return permission === "granted";
  } catch (error) {
    console.error("Error requesting notification permission:", error);
    return false;
  }
}

/**
 * Check if notification permission is granted
 */
export function hasNotificationPermission(): boolean {
  if (typeof window === "undefined") return false;
  if (!("Notification" in window)) return false;
  return Notification.permission === "granted";
}

/**
 * Get FCM token for the current device
 * @param vapidKey - Your VAPID key from Firebase Console
 * @returns Promise<string | null> - FCM token or null
 */
export async function getFCMToken(vapidKey?: string): Promise<string | null> {
  try {
    const messaging = getFirebaseMessaging();
    if (!messaging) {
      console.error("Firebase Messaging not initialized");
      return null;
    }

    // Request permission first
    const hasPermission = await requestNotificationPermission();
    if (!hasPermission) {
      console.log("Notification permission denied");
      return null;
    }

    // Get registration token
    const token = await getToken(messaging, {
      vapidKey: vapidKey || process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY,
    });

    if (token) {
      console.log("FCM Token:", token);
      return token;
    } else {
      console.log("No registration token available");
      return null;
    }
  } catch (error) {
    console.error("Error getting FCM token:", error);
    return null;
  }
}

/**
 * Subscribe to FCM for this device
 * @param userId - The user ID to associate with the token
 * @param vapidKey - Optional VAPID key
 */
export async function subscribeToNotifications(
  userId: string,
  vapidKey?: string
): Promise<boolean> {
  try {
    console.log("🔔 Starting notification subscription for user:", userId);
    
    const token = await getFCMToken(vapidKey);
    if (!token) {
      console.error("❌ Failed to get FCM token");
      return false;
    }

    console.log("📱 Got FCM token, saving to backend...");

    // Save token to backend
    const response = await fetch("/api/notifications/subscribe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, token }),
    });

    const result = await response.json();

    if (!response.ok) {
      console.error("❌ Backend subscription failed:", result);
      throw new Error(result.error || "Failed to save FCM token");
    }

    console.log("✅ Successfully subscribed to notifications:", result);
    return true;
  } catch (error) {
    console.error("❌ Error subscribing to notifications:", error);
    return false;
  }
}

/**
 * Unsubscribe from notifications
 * @param userId - The user ID to unsubscribe
 */
export async function unsubscribeFromNotifications(
  userId: string
): Promise<boolean> {
  try {
    const response = await fetch("/api/notifications/unsubscribe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId }),
    });

    return response.ok;
  } catch (error) {
    console.error("Error unsubscribing from notifications:", error);
    return false;
  }
}

/**
 * Listen for foreground messages
 * @param callback - Function to call when a message is received
 */
export function onForegroundMessage(
  callback: (payload: MessagePayload) => void
): (() => void) | null {
  try {
    const messaging = getFirebaseMessaging();
    if (!messaging) return null;

    return onMessage(messaging, callback);
  } catch (error) {
    console.error("Error setting up foreground message listener:", error);
    return null;
  }
}

/**
 * Show a browser notification
 * @param notification - Notification payload
 */
export async function showNotification(
  notification: NotificationPayload
): Promise<void> {
  if (!hasNotificationPermission()) {
    console.warn("Notification permission not granted");
    return;
  }

  try {
    const registration = await navigator.serviceWorker.ready;
    await registration.showNotification(notification.title, {
      body: notification.body,
      icon: notification.icon || "/icon-192x192.png",
      badge: "/badge-72x72.png",
      data: {
        url: notification.url,
        ...notification.data,
      },
      tag: notification.data?.tag || "default",
      requireInteraction: false,
    });
  } catch (error) {
    console.error("Error showing notification:", error);
  }
}

/**
 * Update notification preferences
 * @param userId - User ID
 * @param preferences - Notification preferences
 */
export async function updateNotificationPreferences(
  userId: string,
  preferences: {
    events?: boolean;
    projects?: boolean;
    admin?: boolean;
    email?: boolean;
  }
): Promise<boolean> {
  try {
    const response = await fetch("/api/notifications/preferences", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, preferences }),
    });

    return response.ok;
  } catch (error) {
    console.error("Error updating notification preferences:", error);
    return false;
  }
}

/**
 * Get notification preferences
 * @param userId - User ID
 */
export async function getNotificationPreferences(userId: string): Promise<{
  events: boolean;
  projects: boolean;
  admin: boolean;
  email: boolean;
} | null> {
  try {
    const response = await fetch(
      `/api/notifications/preferences?userId=${userId}`
    );

    if (!response.ok) return null;

    return await response.json();
  } catch (error) {
    console.error("Error getting notification preferences:", error);
    return null;
  }
}
