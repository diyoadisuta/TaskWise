import { NextRequest, NextResponse } from 'next/server';

let subscriptions: any[] = [];

export async function POST(req: NextRequest) {
  const sub = await req.json();
  // Simpan ke memory (untuk demo, sebaiknya ke DB di produksi)
  subscriptions.push(sub);
  return NextResponse.json({ success: true });
}

export function getAllSubscriptions() {
  return subscriptions;
}
