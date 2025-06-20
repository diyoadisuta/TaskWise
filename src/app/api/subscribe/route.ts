import { NextRequest, NextResponse } from 'next/server';

// Simpan subscription di memory (untuk demo, production: simpan di DB)
const subscriptions: any[] = [];

export async function POST(req: NextRequest) {
  const sub = await req.json();
  subscriptions.push(sub);
  return NextResponse.json({ success: true });
}

// Hapus semua ekspor/fungsi lain, hanya ekspor handler HTTP!
