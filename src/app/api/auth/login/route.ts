import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyPassword, createSession } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();
    if (!email || !password) {
      return NextResponse.json({ error: 'Email dan password wajib diisi.' }, { status: 400 });
    }
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return NextResponse.json({ error: 'Email tidak ditemukan.' }, { status: 404 });
    }
    const valid = await verifyPassword(password, user.password_hash);
    if (!valid) {
      return NextResponse.json({ error: 'Password salah.' }, { status: 401 });
    }
    await createSession(user.id); // Pastikan await agar cookie terset sebelum response
    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json({ error: 'Login gagal.' }, { status: 500 });
  }
}
