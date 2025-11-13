/* Service Worker: public/sw.js
   Handles 'push' and 'notificationclick' events for Web Push.
*/
/* eslint-disable no-restricted-globals */
self.addEventListener('push', (event) => {
  try {
    const payload = event.data ? event.data.json() : {};
    // Provide a friendly default title
    const title = payload.title || 'CODE 4O4';

    // NotificationOptions supported keys: body, icon, badge, image, vibrate, actions, tag, renotify, requireInteraction, silent, data
    const options = {
      body: payload.body || undefined,
  icon: payload.icon || '/app-icon-192.png',
  badge: payload.badge || '/app-icon-72.png',
      image: payload.image || undefined,
      // Vibrate pattern: array of numbers (ms). Many mobile browsers support this when device settings allow.
      vibrate: payload.vibrate || [100, 50, 100],
      data: payload.data || {},
      renotify: payload.renotify || false,
      tag: payload.tag || undefined,
      // keep notification visible until user interacts for high-priority alerts
      requireInteraction: payload.requireInteraction || false,
      // silent: true/false - note: some platforms ignore sound control and use system settings
      silent: payload.silent || false,
      // Actions: array of {action, title, icon}
      actions: payload.actions || [],
    };

    event.waitUntil(self.registration.showNotification(title, options));
  } catch (err) {
    const title = 'New notification';
    event.waitUntil(self.registration.showNotification(title, {}));
  }
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const notificationData = event.notification.data || {};
  const clickUrl = notificationData.url || '/';

  // Handle action buttons (if any)
  const action = event.action;
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(async (clientList) => {
      // If user clicked an action, handle it specially
      if (action) {
        // Example action handlers: 'reply', 'open', 'snooze', 'mark-read'
        if (action === 'reply' && notificationData.replyUrl) {
          if (clients.openWindow) return clients.openWindow(notificationData.replyUrl);
        }
        if (action === 'snooze' && notificationData.snoozeUrl) {
          if (clients.openWindow) return clients.openWindow(notificationData.snoozeUrl);
        }
        if (action === 'mark-read' && notificationData.markReadApi) {
          // Try to call an API route (fire-and-forget)
          try {
            await fetch(notificationData.markReadApi, { method: 'POST' });
          } catch (e) {
            // ignore
          }
        }
      }

      // Otherwise, focus an existing client or open a new one
      for (const client of clientList) {
        try {
          const url = new URL(client.url);
          if (url.pathname === new URL(clickUrl, self.location.origin).pathname && 'focus' in client) {
            return client.focus();
          }
        } catch (e) {
          // ignore parsing errors
        }
      }
      if (clients.openWindow) return clients.openWindow(clickUrl);
    })
  );
});

self.addEventListener('pushsubscriptionchange', (event) => {
  // In many browsers this rarely fires in practice, but it's here for completeness.
  // Ideally the client re-subscribes and sends the new subscription to the server.
  console.log('pushsubscriptionchange', event);
});

// Basic fetch handler so browsers consider this a "network-capable" service worker.
// This keeps the implementation simple: forward requests to network by default.
self.addEventListener('fetch', (event) => {
  try {
    // We do not try to intercept navigation or implement caching here —
    // just ensure we have a fetch handler so the PWA installability checks pass.
    event.respondWith(fetch(event.request));
  } catch (err) {
    // If fetch fails (offline), just let the request fail silently.
    console.warn('Fetch handler error in SW', err);
  }
});

// Allow clients to trigger a skipWaiting to activate this worker immediately.
self.addEventListener('message', (event) => {
  try {
    const data = event.data || {};
    if (data && data.type === 'SKIP_WAITING') {
      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      self.skipWaiting();
    }
  } catch (err) {
    console.warn('sw message handler error', err);
  }
});
