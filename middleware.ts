import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getUserIdFromSession } from '@/lib/auth';

const protectedRoutes = ['/tasks'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (protectedRoutes.some(route => pathname.startsWith(route))) {
    const userId = getUserIdFromSession();
    if (!userId) {
      const loginUrl = new URL('/login', request.url);
      return NextResponse.redirect(loginUrl);
    }
  }
  return NextResponse.next();
}

export const config = {
  matcher: ['/tasks'],
};
