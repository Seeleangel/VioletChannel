import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { writeFile } from 'fs/promises';
import path from 'path';

export async function POST(request) {
    const cookieStore = await cookies();
    const token = cookieStore.get('admin_token');

    if (!token || token.value !== 'authenticated') {
        return NextResponse.json({ error: '无权操作' }, { status: 401 });
    }

    const data = await request.formData();
    const file = data.get('file');

    if (!file) {
        return NextResponse.json({ success: false });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Save to public/uploads
    // Ensure directory exists first? Node fs/promises doesn't have existSync?
    // We can assume public/uploads might need creation.
    const uploadDir = path.join(process.cwd(), 'public', 'uploads');
    /* 
       We should ensure dir exists. However, inside async function simpler to just try write 
       or use fs.mkdir with recursive.
    */
    const fs = require('fs');
    if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
    }

    const filename = Date.now() + '-' + file.name.replace(/\s/g, '-');
    const filepath = path.join(uploadDir, filename);

    await writeFile(filepath, buffer);

    return NextResponse.json({ success: true, url: `/uploads/${filename}` });
}
