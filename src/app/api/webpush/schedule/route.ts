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


export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { sendAt, payload, audience = 'subscribed', meta = {} } = body;
    if (!sendAt || !payload) {
      return NextResponse.json({ error: 'Missing sendAt or payload' }, { status: 400 });
    }

    const sendTs = new Date(sendAt);
    if (isNaN(sendTs.getTime())) {
      return NextResponse.json({ error: 'Invalid sendAt' }, { status: 400 });
    }

    const db = getDb();
    const col = db.collection('webpush_schedules');
    const doc = await col.add({
      sendAt: sendTs,
      payload,
      audience,
      meta,
      status: 'pending',
      createdAt: new Date(),
    });

    return NextResponse.json({ ok: true, id: doc.id }, { status: 201 });
  } catch (err) {
    console.error('schedule POST error', err);
    return NextResponse.json({ error: 'Failed to schedule' }, { status: 500 });
  }
}

export async function GET(req: Request) {
  
  if (!isAdminOrSecret(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const db = getDb();
    const snap = await db.collection('webpush_schedules').orderBy('createdAt', 'desc').limit(200).get();
    const items: any[] = [];
    snap.forEach((doc) => {
      const d = doc.data();
      items.push({ id: doc.id, ...d });
    });
    return NextResponse.json({ items });
  } catch (err) {
    console.error('schedule GET error', err);
    return NextResponse.json({ error: 'Failed to list schedules' }, { status: 500 });
  }
}
