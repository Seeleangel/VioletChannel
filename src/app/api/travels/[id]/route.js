import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const travelsFilePath = path.join(process.cwd(), 'data', 'travels.json');

// PUT - 更新旅行记录
export async function PUT(request, { params }) {
  try {
    const id = parseInt(params.id);
    const updatedData = await request.json();

    if (!fs.existsSync(travelsFilePath)) {
      return NextResponse.json({ error: 'No travels found' }, { status: 404 });
    }

    const fileContents = fs.readFileSync(travelsFilePath, 'utf8');
    let travels = JSON.parse(fileContents);

    const index = travels.findIndex(t => t.id === id);
    if (index === -1) {
      return NextResponse.json({ error: 'Travel not found' }, { status: 404 });
    }

    travels[index] = {
      ...travels[index],
      ...updatedData,
      id, // 确保 ID 不被修改
    };

    fs.writeFileSync(travelsFilePath, JSON.stringify(travels, null, 2));

    return NextResponse.json(travels[index]);
  } catch (error) {
    console.error('Error updating travel:', error);
    return NextResponse.json({ error: 'Failed to update travel' }, { status: 500 });
  }
}

// DELETE - 删除旅行记录
export async function DELETE(request, { params }) {
  try {
    const id = parseInt(params.id);

    if (!fs.existsSync(travelsFilePath)) {
      return NextResponse.json({ error: 'No travels found' }, { status: 404 });
    }

    const fileContents = fs.readFileSync(travelsFilePath, 'utf8');
    let travels = JSON.parse(fileContents);

    const filtered = travels.filter(t => t.id !== id);

    if (filtered.length === travels.length) {
      return NextResponse.json({ error: 'Travel not found' }, { status: 404 });
    }

    fs.writeFileSync(travelsFilePath, JSON.stringify(filtered, null, 2));

    return NextResponse.json({ message: 'Travel deleted' });
  } catch (error) {
    console.error('Error deleting travel:', error);
    return NextResponse.json({ error: 'Failed to delete travel' }, { status: 500 });
  }
}
