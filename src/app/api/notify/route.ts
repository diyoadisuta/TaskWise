import { NextRequest, NextResponse } from 'next/server';
import webpush from 'web-push';
import { getAllSubscriptions } from '../subscribe/route';

webpush.setVapidDetails(
  'mailto:admin@taskwise.com',
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!
);

export async function POST(req: NextRequest) {
  const { title, body, url } = await req.json();
  const payload = JSON.stringify({ title, body, url });
  const subs = getAllSubscriptions();
  for (const sub of subs) {
    try {
      await webpush.sendNotification(sub, payload);
    } catch (e) {
      // ignore error
    }
  }
  return NextResponse.json({ success: true });
}
