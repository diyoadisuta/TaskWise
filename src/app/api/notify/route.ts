import { NextRequest, NextResponse } from 'next/server';
import webpush from 'web-push';

// Simpan subscription di memory (untuk demo, production: simpan di DB)
const subscriptions: any[] = [];

webpush.setVapidDetails(
  'mailto:admin@taskwise.com',
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!
);

// Handler untuk menerima subscription baru (akan dipanggil dari /api/subscribe)
export async function POST(req: NextRequest) {
  if (req.headers.get('content-type')?.includes('application/json')) {
    // Ini request notifikasi
    const { title, body, url } = await req.json();
    const payload = JSON.stringify({ title, body, url });
    for (const sub of subscriptions) {
      try {
        await webpush.sendNotification(sub, payload);
      } catch (e) {
        // ignore error
      }
    }
    return NextResponse.json({ success: true });
  } else {
    // Ini request subscription (fallback, seharusnya tidak terjadi di /api/notify)
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}

// Tambahkan endpoint untuk menerima subscription dari /api/subscribe
export async function PUT(req: NextRequest) {
  const sub = await req.json();
  subscriptions.push(sub);
  return NextResponse.json({ success: true });
}
