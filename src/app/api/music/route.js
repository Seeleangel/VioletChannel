import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

const musicFilePath = path.join(process.cwd(), 'data', 'music.json');
const publicMusicDir = path.join(process.cwd(), 'public', 'music');

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

function normalizeMusicItem(item) {
    return {
        ...item,
        id: String(item.id),
        url: item.url || item.file || '',
        file: item.file || item.url || '',
    };
}

function inferTitleFromFilename(fileName) {
    const ext = path.extname(fileName);
    const base = path.basename(fileName, ext);
    const parts = base.split('-');
    if (parts.length >= 2) {
        return parts.slice(1).join('-').trim();
    }
    return base;
}

function inferArtistFromFilename(fileName) {
    const ext = path.extname(fileName);
    const base = path.basename(fileName, ext);
    const parts = base.split('-');
    if (parts.length >= 2) {
        return parts[0].trim();
    }
    return '未知艺术家';
}

async function readPublicMusicAsList() {
    try {
        const files = await fs.readdir(publicMusicDir);
        const audioFiles = files.filter((file) => {
            const ext = path.extname(file).toLowerCase();
            return ['.mp3', '.wav', '.flac', '.m4a', '.ogg'].includes(ext);
        });

        return audioFiles.map((file, index) => ({
            id: `local-${index + 1}`,
            title: inferTitleFromFilename(file),
            artist: inferArtistFromFilename(file),
            url: `/music/${file}`,
            file: `/music/${file}`,
            cover: '',
        }));
    } catch (error) {
        return [];
    }
}

// GET - 获取音乐列表
export async function GET() {
    try {
        let musicList = await readMusicList();

        if (!Array.isArray(musicList)) {
            musicList = [];
        }

        if (musicList.length === 0) {
            const publicMusic = await readPublicMusicAsList();
            if (publicMusic.length > 0) {
                await writeMusicList(publicMusic);
                musicList = publicMusic;
            }
        }

        const normalized = musicList.map(normalizeMusicItem);
        return NextResponse.json(normalized);
    } catch (error) {
        console.error('Error reading music list:', error);
        return NextResponse.json({ error: 'Failed to load music' }, { status: 500 });
    }
}

// POST - 添加新音乐
export async function POST(request) {
    try {
        const newMusic = await request.json();
        const musicList = await readMusicList();

        const payload = {
            title: (newMusic.title || '').trim(),
            artist: (newMusic.artist || '').trim(),
            url: (newMusic.url || '').trim(),
            cover: (newMusic.cover || '').trim(),
        };

        if (!payload.title || !payload.artist || !payload.url) {
            return NextResponse.json({ error: 'title, artist, url are required' }, { status: 400 });
        }

        // 生成唯一 ID
        const id = Date.now().toString();
        const musicWithId = {
            id,
            ...payload,
            file: payload.url,
        };

        musicList.push(musicWithId);
        await writeMusicList(musicList);

        return NextResponse.json(normalizeMusicItem(musicWithId));
    } catch (error) {
        console.error('Error adding music:', error);
        return NextResponse.json({ error: 'Failed to add music' }, { status: 500 });
    }
}
