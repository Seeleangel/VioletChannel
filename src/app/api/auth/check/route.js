import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const NO_STORE_HEADERS = {
    'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
    Pragma: 'no-cache',
    Expires: '0',
};

export async function GET() {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get('admin_token');

        if (token && token.value === 'authenticated') {
            return NextResponse.json({ isAdmin: true }, { headers: NO_STORE_HEADERS });
        } else {
            return NextResponse.json({ isAdmin: false }, { headers: NO_STORE_HEADERS });
        }
    } catch (error) {
        console.error('Auth check error:', error);
        return NextResponse.json({ isAdmin: false }, { status: 500, headers: NO_STORE_HEADERS });
    }
}
