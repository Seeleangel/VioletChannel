import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getPosts, savePost } from '../../../lib/posts';

export async function GET() {
    try {
        const posts = getPosts();
        return NextResponse.json(posts);
    } catch (error) {
        console.error('Failed to fetch posts:', error);
        return NextResponse.json({ error: 'Failed to load posts' }, { status: 500 });
    }
}

export async function POST(request) {
    const cookieStore = await cookies();
    const token = cookieStore.get('admin_token');

    if (!token || token.value !== 'authenticated') {
        return NextResponse.json({ error: '无权操作' }, { status: 401 });
    }

    const body = await request.json();
    // Basic validation could go here
    const newPost = savePost(body);
    return NextResponse.json(newPost, { status: 201 });
}
