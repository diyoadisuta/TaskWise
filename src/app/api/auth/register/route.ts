import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { hashPassword } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();
    if (!email || !password) {
      return NextResponse.json({ error: 'Email dan password wajib diisi.' }, { status: 400 });
    }
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ error: 'Email sudah terdaftar.' }, { status: 409 });
    }
    const password_hash = await hashPassword(password);
    const user = await prisma.user.create({
      data: { email, password_hash },
      select: { id: true, email: true, created_at: true },
    });
    return NextResponse.json({ user });
  } catch (e) {
    return NextResponse.json({ error: 'Registrasi gagal.' }, { status: 500 });
  }
}
