import * as webpush from 'web-push';
import { getDb } from '../firebase/admin';

const COLLECTION = 'webpush_subscriptions';

function getVapidConfig() {
  const publicKey = process.env.WEBPUSH_PUBLIC_KEY;
  const privateKey = process.env.WEBPUSH_PRIVATE_KEY;
  const subject = process.env.WEBPUSH_SUBJECT || 'mailto:admin@example.com';
  if (!publicKey || !privateKey) {
    throw new Error('Missing WEBPUSH_PUBLIC_KEY or WEBPUSH_PRIVATE_KEY environment variables');
  }
  return { publicKey, privateKey, subject };
}

export function initWebPushIfNeeded() {
  try {
    const { publicKey, privateKey, subject } = getVapidConfig();
    webpush.setVapidDetails(subject, publicKey, privateKey);
  } catch (err) {
    
    throw err;
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function saveSubscription(payload: any) {
  
  const subscription = payload.subscription || payload;
  const userId = payload.userId || null;
  const db = getDb();
  const col = db.collection(COLLECTION);
  const id = encodeURIComponent(subscription.endpoint);
  const docRef = col.doc(id);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const data: any = { subscription, createdAt: new Date() };
  if (userId) data.userId = userId;
  await docRef.set(data, { merge: true });
  return docRef.id;
}

export async function removeSubscriptionByEndpoint(endpoint: string) {
  const db = getDb();
  const col = db.collection(COLLECTION);
  const id = encodeURIComponent(endpoint);
  await col.doc(id).delete();
}

export async function listAllSubscriptions() {
  const db = getDb();
  const snap = await db.collection(COLLECTION).get();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const items: any[] = [];
  snap.forEach((doc) => {
    const d = doc.data();
    items.push({ subscription: d.subscription, userId: d.userId || null });
  });
  return items;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function sendNotificationToSubscription(subscription: any, payload: any) {
  initWebPushIfNeeded();
  try {
    const result = await webpush.sendNotification(subscription, JSON.stringify(payload));
    return { success: true, result };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (err: any) {
    
    return { success: false, error: err };
  }
}
