import { NextResponse } from 'next/server';
import { getDb } from '../../../../lib/firebase/admin';

function isAdminOrSecret(req: Request) {
  const secret = req.headers.get('x-webpush-secret') || '';
  const cookieHeader = req.headers.get('cookie');
  if (cookieHeader) {
    try {
      const cookies = cookieHeader.split(';').map(c => c.trim());
      const userCookie = cookies.find(c => c.startsWith('code404-user='));
      if (userCookie) {
        const raw = userCookie.split('=')[1];
        if (raw) {
          const user = JSON.parse(decodeURIComponent(raw));
          if (user && (user.role === 'admin' || user.role === 'mentor')) return true;
        }
      }
    } catch (e) {
      
    }
  }
  if (process.env.WEBPUSH_SEND_SECRET && secret === process.env.WEBPUSH_SEND_SECRET) return true;
  return false;
}

export async function GET(req: Request) {
  if (!isAdminOrSecret(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const db = getDb();
    const snap = await db.collection('webpush_subscriptions').get();
    const items: any[] = [];
    snap.forEach((doc) => {
      const d = doc.data();
      items.push({ id: doc.id, ...d });
    });
    return NextResponse.json({ items });
  } catch (err) {
    console.error('subscriptions GET error', err);
    return NextResponse.json({ error: 'Failed to list subscriptions' }, { status: 500 });
  }
}
