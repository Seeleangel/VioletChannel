import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const NO_STORE_HEADERS = {
  'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
  Pragma: 'no-cache',
  Expires: '0',
};

export async function POST(request) {
  try {
    const body = await request.json();
    const submittedPassword = typeof body?.password === 'string' ? body.password.trim() : '';
    const correctPassword =
      typeof process.env.ADMIN_PASSWORD === 'string' ? process.env.ADMIN_PASSWORD.trim() : '';

    if (!correctPassword) {
      console.error('ADMIN_PASSWORD is not configured on the server');
      return NextResponse.json(
        { error: 'ADMIN_PASSWORD is not configured' },
        { status: 500, headers: NO_STORE_HEADERS },
      );
    }

    if (submittedPassword === correctPassword) {
      const cookieStore = await cookies();
      cookieStore.set('admin_token', 'authenticated', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 60 * 60 * 24 * 7,
        path: '/',
      });

      return NextResponse.json({ success: true }, { headers: NO_STORE_HEADERS });
    }

    return NextResponse.json({ error: '密码错误' }, { status: 401, headers: NO_STORE_HEADERS });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ error: '登录失败' }, { status: 500, headers: NO_STORE_HEADERS });
  }
}
