import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

const profileFilePath = path.join(process.cwd(), 'data', 'profile.json');

// GET - 获取个人资料
export async function GET() {
  try {
    const data = await fs.readFile(profileFilePath, 'utf-8');
    const profile = JSON.parse(data);
    return NextResponse.json(profile);
  } catch (error) {
    console.error('Error reading profile:', error);
    return NextResponse.json(
      {
        aboutMe: {
          image: '/img/aboutme.jpg',
          name: '',
          subtitle: '',
          paragraphs: []
        },
        basicInfo: []
      },
      { status: 200 }
    );
  }
}

// PUT - 更新个人资料
export async function PUT(request) {
  try {
    const updatedProfile = await request.json();
    await fs.writeFile(profileFilePath, JSON.stringify(updatedProfile, null, 2), 'utf-8');
    return NextResponse.json(updatedProfile);
  } catch (error) {
    console.error('Error updating profile:', error);
    return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 });
  }
}
