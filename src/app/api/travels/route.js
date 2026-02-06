import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const travelsFilePath = path.join(process.cwd(), 'data', 'travels.json');

// GET - 获取所有旅行记录
export async function GET() {
  try {
    const fileContents = fs.readFileSync(travelsFilePath, 'utf8');
    const travels = JSON.parse(fileContents);
    return NextResponse.json(travels);
  } catch (error) {
    console.error('Error reading travels:', error);
    return NextResponse.json([], { status: 200 });
  }
}

// POST - 添加新的旅行记录
export async function POST(request) {
  try {
    const newTravel = await request.json();
    
    // 读取现有数据
    let travels = [];
    if (fs.existsSync(travelsFilePath)) {
      const fileContents = fs.readFileSync(travelsFilePath, 'utf8');
      travels = JSON.parse(fileContents);
    }
    
    // 生成新ID
    const maxId = travels.length > 0 ? Math.max(...travels.map(t => t.id)) : 0;
    newTravel.id = maxId + 1;
    
    // 添加时间戳
    newTravel.createdAt = new Date().toISOString();
    
    travels.push(newTravel);
    
    // 保存到文件
    fs.writeFileSync(travelsFilePath, JSON.stringify(travels, null, 2));
    
    return NextResponse.json(newTravel, { status: 201 });
  } catch (error) {
    console.error('Error adding travel:', error);
    return NextResponse.json({ error: 'Failed to add travel' }, { status: 500 });
  }
}

// PUT - 更新旅行记录
export async function PUT(request) {
  try {
    const updatedTravel = await request.json();
    
    if (!fs.existsSync(travelsFilePath)) {
      return NextResponse.json({ error: 'No travels found' }, { status: 404 });
    }
    
    const fileContents = fs.readFileSync(travelsFilePath, 'utf8');
    let travels = JSON.parse(fileContents);
    
    const index = travels.findIndex(t => t.id === updatedTravel.id);
    if (index === -1) {
      return NextResponse.json({ error: 'Travel not found' }, { status: 404 });
    }
    
    travels[index] = { ...travels[index], ...updatedTravel };
    
    fs.writeFileSync(travelsFilePath, JSON.stringify(travels, null, 2));
    
    return NextResponse.json(travels[index]);
  } catch (error) {
    console.error('Error updating travel:', error);
    return NextResponse.json({ error: 'Failed to update travel' }, { status: 500 });
  }
}

// DELETE - 删除旅行记录
export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = parseInt(searchParams.get('id'));
    
    if (!id) {
      return NextResponse.json({ error: 'ID required' }, { status: 400 });
    }
    
    if (!fs.existsSync(travelsFilePath)) {
      return NextResponse.json({ error: 'No travels found' }, { status: 404 });
    }
    
    const fileContents = fs.readFileSync(travelsFilePath, 'utf8');
    let travels = JSON.parse(fileContents);
    
    travels = travels.filter(t => t.id !== id);
    
    fs.writeFileSync(travelsFilePath, JSON.stringify(travels, null, 2));
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting travel:', error);
    return NextResponse.json({ error: 'Failed to delete travel' }, { status: 500 });
  }
}
