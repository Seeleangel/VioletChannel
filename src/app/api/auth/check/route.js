import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET() {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get('admin_token');

        if (token && token.value === 'authenticated') {
            return NextResponse.json({ isAdmin: true });
        } else {
            return NextResponse.json({ isAdmin: false });
        }
    } catch (error) {
        console.error('Auth check error:', error);
        return NextResponse.json({ isAdmin: false }, { status: 500 });
    }
}
