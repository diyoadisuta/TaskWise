import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';
import { NextRequest } from 'next/server';

const JWT_SECRET = process.env.JWT_SECRET || 'changeme';
const COOKIE_NAME = 'session_token';

export async function hashPassword(password: string) {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hash: string) {
  return bcrypt.compare(password, hash);
}

export async function createSession(userId: string) {
  const token = jwt.sign({ userId }, JWT_SECRET, { expiresIn: '7d' });
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, { httpOnly: true, path: '/' });
}

export async function destroySession() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

export async function getUserIdFromSession(): Promise<string | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;
  try {
    const payload = jwt.verify(token, JWT_SECRET) as { userId: string };
    return payload.userId;
  } catch {
    return null;
  }
}

export function getUserIdFromRequest(req: NextRequest): string | null {
  const token = req.cookies.get(COOKIE_NAME)?.value;
  if (!token) return null;
  try {
    const payload = jwt.verify(token, JWT_SECRET) as { userId: string };
    return payload.userId;
  } catch {
    return null;
  }
}
