import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
    try {
        const musicDir = path.join(process.cwd(), 'public', 'music');
        if (!fs.existsSync(musicDir)) {
            return NextResponse.json([]);
        }

        const files = fs.readdirSync(musicDir).filter(file => {
            const ext = path.extname(file).toLowerCase();
            return ['.mp3', '.wav', '.flac', '.m4a', '.ogg'].includes(ext);
        });

        return NextResponse.json(files);
    } catch (error) {
        console.error('Error reading music directory:', error);
        return NextResponse.json({ error: 'Failed to list music files' }, { status: 500 });
    }
}
