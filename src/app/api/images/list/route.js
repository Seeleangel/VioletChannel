import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
    try {
        const imgDir = path.join(process.cwd(), 'public', 'img');

        // Ensure directory exists
        if (!fs.existsSync(imgDir)) {
            return NextResponse.json([]);
        }

        const files = fs.readdirSync(imgDir);

        // Filter for compressed images (jpg, jpeg, png, gif, webp) starting with 'compressed-'
        const imageFiles = files.filter(file => {
            const ext = path.extname(file).toLowerCase();
            const isImageFile = ['.jpg', '.jpeg', '.png', '.gif', '.webp'].includes(ext);
            const isCompressed = file.startsWith('compressed-');
            return isImageFile && isCompressed;
        });

        // Sort by filename
        imageFiles.sort((a, b) => a.localeCompare(b));

        // Map to objects with src and caption
        const images = imageFiles.map(file => {
            const filename = path.basename(file, path.extname(file));
            // Remove 'compressed-' prefix for caption
            const caption = filename.replace('compressed-', '');
            return {
                src: `/img/${file}`,
                caption: caption
            };
        });

        return NextResponse.json(images);

    } catch (error) {
        console.error('Error reading image directory:', error);
        return NextResponse.json({ error: 'Failed to list images' }, { status: 500 });
    }
}
