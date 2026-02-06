import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST(request) {
    try {
        const body = await request.json();
        const { password } = body;

        const correctPassword = process.env.ADMIN_PASSWORD;

        if (password === correctPassword) {
            // 设置 cookie
            const cookieStore = await cookies();
            cookieStore.set('admin_token', 'authenticated', {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
                maxAge: 60 * 60 * 24 * 7, // 7 days
                path: '/',
            });

            return NextResponse.json({ success: true });
        } else {
            return NextResponse.json({ error: '密码错误' }, { status: 401 });
        }
    } catch (error) {
        return NextResponse.json({ error: '登录失败' }, { status: 500 });
    }
}
