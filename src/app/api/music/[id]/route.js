import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

const musicFilePath = path.join(process.cwd(), 'data', 'music.json');

function normalizeMusicItem(item) {
    return {
        ...item,
        id: String(item.id),
        url: item.url || item.file || '',
        file: item.file || item.url || '',
    };
}

// 读取音乐列表
async function readMusicList() {
    try {
        const data = await fs.readFile(musicFilePath, 'utf-8');
        return JSON.parse(data);
    } catch (error) {
        return [];
    }
}

// 写入音乐列表
async function writeMusicList(musicList) {
    await fs.writeFile(musicFilePath, JSON.stringify(musicList, null, 2), 'utf-8');
}

// PUT - 更新音乐
export async function PUT(request, { params }) {
    try {
        const id = String(params.id);
        const updatedData = await request.json();
        const musicList = await readMusicList();

        const payload = {
            title: (updatedData.title || '').trim(),
            artist: (updatedData.artist || '').trim(),
            url: (updatedData.url || '').trim(),
            cover: (updatedData.cover || '').trim(),
        };

        if (!payload.title || !payload.artist || !payload.url) {
            return NextResponse.json({ error: 'title, artist, url are required' }, { status: 400 });
        }

        const index = musicList.findIndex(m => String(m.id) === id);
        if (index === -1) {
            return NextResponse.json({ error: 'Music not found' }, { status: 404 });
        }

        musicList[index] = {
            ...musicList[index],
            ...payload,
            id, // 确保 ID 不被修改
            file: payload.url,
        };

        await writeMusicList(musicList);
        return NextResponse.json(normalizeMusicItem(musicList[index]));
    } catch (error) {
        console.error('Error updating music:', error);
        return NextResponse.json({ error: 'Failed to update music' }, { status: 500 });
    }
}

// DELETE - 删除音乐
export async function DELETE(request, { params }) {
    try {
        const id = String(params.id);
        const musicList = await readMusicList();

        const filtered = musicList.filter(m => String(m.id) !== id);

        if (filtered.length === musicList.length) {
            return NextResponse.json({ error: 'Music not found' }, { status: 404 });
        }

        await writeMusicList(filtered);
        return NextResponse.json({ message: 'Music deleted' });
    } catch (error) {
        console.error('Error deleting music:', error);
        return NextResponse.json({ error: 'Failed to delete music' }, { status: 500 });
    }
}
