import { NextResponse, type NextRequest } from 'next/server';
import { SESSION_COOKIE, readToken } from '@/lib/session';

/** Rutas que exigen sesión de cliente mayorista. */
const PROTECTED = ['/distribucion', '/mi-cuenta'];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (!PROTECTED.some((p) => pathname === p || pathname.startsWith(`${p}/`))) {
    return NextResponse.next();
  }

  const token = request.cookies.get(SESSION_COOKIE)?.value;
  const session = token ? await readToken(token) : null;

  if (!session) {
    const url = request.nextUrl.clone();
    url.pathname = '/acceder';
    url.search = `?next=${encodeURIComponent(pathname)}`;
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/distribucion/:path*', '/mi-cuenta/:path*'],
};
