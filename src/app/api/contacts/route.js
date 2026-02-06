import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

// GET: 获取所有联系记录
export async function GET() {
    try {
        const contactsPath = path.join(process.cwd(), 'data', 'contacts.json');

        if (!fs.existsSync(contactsPath)) {
            return NextResponse.json([]);
        }

        const data = fs.readFileSync(contactsPath, 'utf-8');
        const contacts = JSON.parse(data);

        return NextResponse.json(contacts);
    } catch (error) {
        console.error('Error reading contacts:', error);
        return NextResponse.json({ error: 'Failed to read contacts' }, { status: 500 });
    }
}

// POST: 提交新的联系记录
export async function POST(request) {
    try {
        const contactsPath = path.join(process.cwd(), 'data', 'contacts.json');
        const body = await request.json();

        // 验证必填字段
        if (!body.name || !body.message) {
            return NextResponse.json({ error: '姓名和留言不能为空' }, { status: 400 });
        }

        // 读取现有数据
        let contacts = [];
        if (fs.existsSync(contactsPath)) {
            const data = fs.readFileSync(contactsPath, 'utf-8');
            contacts = JSON.parse(data);
        }

        // 创建新记录
        const newContact = {
            id: Date.now(),
            name: body.name,
            interest: body.interest || '',
            relationship: body.relationship || '',
            message: body.message,
            submittedAt: new Date().toISOString(),
            read: false // 标记是否已读
        };

        // 添加到数组开头（最新的在前面）
        contacts.unshift(newContact);

        // 保存到文件
        fs.writeFileSync(contactsPath, JSON.stringify(contacts, null, 2));

        return NextResponse.json({ success: true, contact: newContact });
    } catch (error) {
        console.error('Error saving contact:', error);
        return NextResponse.json({ error: '提交失败' }, { status: 500 });
    }
}

// PATCH: 更新联系记录（例如标记为已读）
export async function PATCH(request) {
    try {
        const contactsPath = path.join(process.cwd(), 'data', 'contacts.json');
        const body = await request.json();

        if (!body.id) {
            return NextResponse.json({ error: 'Contact ID required' }, { status: 400 });
        }

        let contacts = [];
        if (fs.existsSync(contactsPath)) {
            const data = fs.readFileSync(contactsPath, 'utf-8');
            contacts = JSON.parse(data);
        }

        // 找到并更新记录
        const index = contacts.findIndex(c => c.id === body.id);
        if (index === -1) {
            return NextResponse.json({ error: 'Contact not found' }, { status: 404 });
        }

        contacts[index] = { ...contacts[index], ...body };

        fs.writeFileSync(contactsPath, JSON.stringify(contacts, null, 2));

        return NextResponse.json({ success: true, contact: contacts[index] });
    } catch (error) {
        console.error('Error updating contact:', error);
        return NextResponse.json({ error: '更新失败' }, { status: 500 });
    }
}
