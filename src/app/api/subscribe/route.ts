import { NextRequest, NextResponse } from 'next/server';

// Untuk demo, simpan subscription di memory (production: simpan di DB)
const subscriptions: any[] = [];

export async function POST(req: NextRequest) {
  const sub = await req.json();
  subscriptions.push(sub);
  return NextResponse.json({ success: true });
}

// Hapus ekspor fungsi lain, hanya ekspor handler HTTP!
