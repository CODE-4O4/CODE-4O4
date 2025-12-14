import { NextResponse } from 'next/server';
import {
  listAllSubscriptions,
  sendNotificationToSubscription,
  removeSubscriptionByEndpoint,
} from '../../../../lib/server/webpush-server';
import { getDb, serverTimestamp } from '../../../../lib/firebase/admin';

function isAdminFromCookie(cookieHeader: string | null) {
  if (!cookieHeader) return false;
  try {
    const cookies = cookieHeader.split(';').map(c => c.trim());
    const userCookie = cookies.find(c => c.startsWith('code404-user='));
    if (!userCookie) return false;
    const raw = userCookie.split('=')[1];
    if (!raw) return false;
    const decoded = decodeURIComponent(raw);
    const user = JSON.parse(decoded);
    return user && user.role === 'admin';
  } catch {
    return false;
  }
}

export async function POST(req: Request) {
  const secret = req.headers.get('x-webpush-secret') || '';
  const cookieHeader = req.headers.get('cookie');
  const isAdmin = isAdminFromCookie(cookieHeader);

  if (!isAdmin && (!process.env.WEBPUSH_SEND_SECRET || secret !== process.env.WEBPUSH_SEND_SECRET)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const requestBody = await req.json() as any;
    const raw = requestBody.payload || { title: 'Test', body: 'This is a test notification' };

    
    
    const payload = {
      title: raw.title || 'DevForge',
      body: raw.body || '',
      icon: raw.icon || '/app-icon-192.png',
      badge: raw.badge || '/app-icon-72.png',
      image: raw.image || undefined,
      
      vibrate: raw.vibrate || [200, 100, 200],
      
      tag: raw.tag || raw.type || undefined,
      renotify: raw.renotify !== undefined ? raw.renotify : false,
      requireInteraction: raw.requireInteraction || false,
      actions: raw.actions || [],
      data: raw.data || {},
    } as any; // eslint-disable-line @typescript-eslint/no-explicit-any

    const db = getDb();
    const subs = await listAllSubscriptions();
    const notifiedUsers = new Set<string>();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const results: any[] = [];
    for (const wrapped of subs) {
      const sub = wrapped.subscription || wrapped;
      if (wrapped.userId) {
        notifiedUsers.add(wrapped.userId);
      }
      const r = await sendNotificationToSubscription(sub, payload);
      results.push({ endpoint: sub.endpoint, success: r.success });
      if (!r.success) {
        const status = r.error && r.error.statusCode;
        if (status === 410 || status === 404) {
          
          try {
            await removeSubscriptionByEndpoint(sub.endpoint);
          } catch (err) {
            console.warn('Failed to remove subscription after 410:', err);
          }
        }
      }
    }
    const notificationPayload = {
      title: payload.title || 'DevForge',
      body: payload.body || '',
      icon: payload.icon || '/app-icon-192.png',
      url: payload.data?.url || payload.url || '/',
      tag: payload.tag || null,
      source: payload.tag || payload.type || 'webpush',
    };

    const writes = Array.from(notifiedUsers).map((userId) =>
      db.collection('notifications').add({
        userId,
        title: notificationPayload.title,
        body: notificationPayload.body,
        icon: notificationPayload.icon,
        url: notificationPayload.url,
        tag: notificationPayload.tag,
        source: notificationPayload.source,
        read: false,
        createdAt: serverTimestamp(),
      }),
    );
    if (writes.length) {
      await Promise.all(writes);
    }

    return NextResponse.json({ results });
  } catch (err) {
    console.error('send POST error', err);
    return NextResponse.json({ error: 'Failed to send notifications' }, { status: 500 });
  }
}
