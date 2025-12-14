import { NextResponse } from 'next/server';
import { saveSubscription, removeSubscriptionByEndpoint } from '../../../../lib/server/webpush-server';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const subscription = body.subscription;
    const userId = body.userId || null;
    if (!subscription || !subscription.endpoint) {
      return NextResponse.json({ error: 'Invalid subscription' }, { status: 400 });
    }
    
    await saveSubscription({ subscription, userId });
    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (err) {
    console.error('subscribe POST error', err);
    return NextResponse.json({ error: 'Failed to save subscription' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const body = await req.json();
    const subscription = body.subscription;
    if (!subscription || !subscription.endpoint) {
      return NextResponse.json({ error: 'Invalid subscription' }, { status: 400 });
    }
    await removeSubscriptionByEndpoint(subscription.endpoint);
    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (err) {
    console.error('subscribe DELETE error', err);
    return NextResponse.json({ error: 'Failed to remove subscription' }, { status: 500 });
  }
}
