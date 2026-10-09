import { NextResponse } from 'next/server';

function isAuthenticated(request) {
  return request.cookies.get('admin_token')?.value === 'authenticated';
}

export function middleware(request) {
  const { pathname } = request.nextUrl;
  const authenticated = isAuthenticated(request);
  const needsLogin =
    pathname.startsWith('/admin') ||
    pathname === '/blog/new' ||
    /^\/blog\/[^/]+\/edit$/.test(pathname);

  if (needsLogin) {
    if (authenticated) {
      return NextResponse.next();
    }

    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('next', pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (
    pathname.startsWith('/api/upload') ||
    pathname.startsWith('/api/images/delete')
  ) {
    if (authenticated) {
      return NextResponse.next();
    }

    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/blog/new', '/blog/:path*/edit', '/api/upload', '/api/images/delete'],
};
