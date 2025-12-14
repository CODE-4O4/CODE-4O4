import { NextResponse } from 'next/server';
import { getDb, serverTimestamp } from '../../../../lib/firebase/admin';
import { listAllSubscriptions, sendNotificationToSubscription } from '../../../../lib/server/webpush-server';


export async function POST(req: Request) {
  const secret = req.headers.get('x-webpush-secret') || '';
  if (!process.env.WEBPUSH_SEND_SECRET || secret !== process.env.WEBPUSH_SEND_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const db = getDb();
    const now = new Date();
    
    
    
    
    let snap;
    try {
      snap = await db.collection('webpush_schedules')
        .where('status', '==', 'pending')
        .where('sendAt', '<=', now)
        .get();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) { 
      
      if (err && err.code === 9 && String(err.message).includes('requires an index')) {
        console.warn('Composite index required for sendAt<=now query; falling back to in-memory filter');
        const allPending = await db.collection('webpush_schedules').where('status', '==', 'pending').get();
        
        const docs = allPending.docs.filter(d => {
          const data = d.data();
          const sendAt = data.sendAt?.toDate ? data.sendAt.toDate() : new Date(data.sendAt);
          return sendAt <= now;
        });
        
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        snap = { docs } as any;
      } else {
        throw err;
      }
    }

    
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const results: any[] = [];
    for (const doc of snap.docs) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const notification = doc.data() as any;
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const payload = JSON.parse(notification.payload) as any;
        const audience = notification.audience || 'subscribed';

        
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        let subs: any[] = [];
        if (audience === 'subscribed' || audience === 'all') {
          subs = await listAllSubscriptions();
        }

        
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const perScheduleResults: any[] = [];
        const userIds = new Set<string>();
        for (const wrapped of subs) {
          
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const subscription = (wrapped && (wrapped as any).subscription ? (wrapped as any).subscription : wrapped) as any;
          const endpoint = subscription && subscription.endpoint ? subscription.endpoint : null;
          if (wrapped.userId) {
            userIds.add(wrapped.userId);
          }


          const r = await sendNotificationToSubscription(subscription, payload);

          
          perScheduleResults.push({ endpoint: endpoint || null, success: r.success });

          if (!r.success) {
            const errorCode = r.error && r.error.statusCode;
            if (errorCode === 410 || errorCode === 404) {
              try {
                if (endpoint) {
                  await db.collection('webpush_subscriptions').doc(encodeURIComponent(endpoint)).delete();
                }
              } catch {  }
            }
          }
        }

        
        
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const cleanedResults = perScheduleResults.map((item: any) => {
          
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const c: any = { ...item };
          Object.keys(c).forEach((k) => {
            if (c[k] === undefined) c[k] = null;
          });
          return c;
        });

        if (userIds.size > 0) {
          const writes = Array.from(userIds).map((userId) =>
            db.collection('notifications').add({
              userId,
              title: payload.title || 'DevForge',
              body: payload.body || '',
              icon: payload.icon || '/app-icon-192.png',
              url: payload.data?.url || payload.url || '/',
              tag: payload.tag || null,
              source: payload.tag || payload.type || 'webpush-schedule',
              read: false,
              createdAt: serverTimestamp(),
            }),
          );
          await Promise.all(writes);
        }

        await doc.ref.update({ status: 'sent', sentAt: new Date(), results: cleanedResults });
        results.push({ id: doc.id, ok: true, count: cleanedResults.length });
      } catch (err) {
        console.error('Failed processing schedule', doc.id, err);
        const message = err instanceof Error ? err.message : String(err);
        const stack = err instanceof Error && process.env.NODE_ENV !== 'production' ? err.stack : undefined;
        await doc.ref.update({ status: 'failed', error: message, triedAt: new Date(), errorStack: stack });
        results.push({ id: doc.id, ok: false, error: message, stack });
      }
    }

    return NextResponse.json({ results });
  } catch (err) {
    console.error('process-schedules error', err);
    
    const isDev = process.env.NODE_ENV !== 'production';
    const message = err instanceof Error ? err.message : String(err);
    const stack = err instanceof Error && isDev ? err.stack : undefined;
    return NextResponse.json({ error: 'Failed to process schedules', message, stack }, { status: 500 });
  }
}
