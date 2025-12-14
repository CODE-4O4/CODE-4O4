

export interface NotificationPayload {
  title: string;
  body: string;
  icon?: string;
  data?: Record<string, string>;
  url?: string;
}

export async function requestNotificationPermission(): Promise<boolean> {
  console.warn("Notifications are disabled in this build");
  return false;
}

export function hasNotificationPermission(): boolean {
  return false;
}

export async function getFCMToken(_vapidKey?: string): Promise<string | null> {
  return null;
}


export async function subscribeToNotifications(_userId: string, _vapidKey?: string): Promise<boolean> {
  return false;
}

export async function unsubscribeFromNotifications(_userId: string): Promise<boolean> {
  return false;
}


export function onForegroundMessage(_callback: (payload: any) => void): (() => void) | null {
  return null;
}

export async function showNotification(_notification: NotificationPayload): Promise<void> {
  
}


export async function updateNotificationPreferences(_userId: string, _preferences: any): Promise<boolean> {
  return false;
}

export async function getNotificationPreferences(_userId: string): Promise<any | null> {
  return null;
}
