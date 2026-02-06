import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
    try {
        const musicDir = path.join(process.cwd(), 'public', 'music');

        if (!fs.existsSync(musicDir)) {
            return NextResponse.json([]);
        }

        const files = fs.readdirSync(musicDir);
        const audioExtensions = ['.mp3', '.flac', '.wav', '.m4a'];

        const songs = files
            .filter(file => audioExtensions.includes(path.extname(file).toLowerCase()))
            .map(file => {
                const ext = path.extname(file);
                const basename = path.basename(file, ext);
                let title = basename;
                let artist = 'Unknown Artist';

                // Try to parse "Artist - Title" format
                if (basename.includes('-')) {
                    const parts = basename.split('-');
                    // Assuming format: Artist - Title
                    // But filenames might have multiple hyphens.
                    // Let's assume the first part is artist, rest is title
                    artist = parts[0].trim();
                    title = parts.slice(1).join('-').trim();
                }

                return {
                    title,
                    artist,
                    file: `/music/${file}`
                };
            });

        return NextResponse.json(songs);
    } catch (error) {
        console.error('Error reading music directory:', error);
        return NextResponse.json({ error: 'Failed to load music' }, { status: 500 });
    }
}
