import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import fs from 'fs';
import { writeFile } from 'fs/promises';
import path from 'path';

let sharpModulePromise;

function sanitizeFilename(name) {
  return name
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^a-zA-Z0-9._-\u4e00-\u9fa5]/g, '-');
}

async function prepareFileBuffer(file) {
  const bytes = await file.arrayBuffer();
  const originalSize = bytes.byteLength;
  let buffer = Buffer.from(bytes);
  let isCompressed = false;
  const sharp = await getSharp();

  if (sharp && originalSize > 2 * 1024 * 1024) {
    try {
      const compressedBuffer = await sharp(buffer)
        .jpeg({ quality: 80, mozjpeg: true })
        .toBuffer();

      if (compressedBuffer.length < buffer.length) {
        buffer = compressedBuffer;
        isCompressed = true;
      }
    } catch (error) {
      console.error('Auto-compression failed (ignoring):', error);
    }
  }

  return { buffer, isCompressed };
}

async function getSharp() {
  if (!sharpModulePromise) {
    sharpModulePromise = import('sharp')
      .then((module) => module.default)
      .catch((error) => {
        console.error('Sharp is unavailable for uploads, using raw file buffers:', error);
        return null;
      });
  }

  return sharpModulePromise;
}

function buildCaption(file) {
  const filename = path.basename(file, path.extname(file));

  return filename
    .replace(/^gallery-\d+-/, '')
    .replace(/^gallery-/, '')
    .replace(/[-_]+/g, ' ')
    .trim();
}

export async function POST(request) {
  const cookieStore = await cookies();
  const token = cookieStore.get('admin_token');

  if (!token || token.value !== 'authenticated') {
    return NextResponse.json({ error: '无权操作' }, { status: 401 });
  }

  const data = await request.formData();
  const collection = data.get('collection');
  const files = [
    ...data.getAll('file'),
    ...data.getAll('images'),
  ].filter((item) => item && typeof item.arrayBuffer === 'function');

  if (files.length === 0) {
    return NextResponse.json({ success: false, error: 'No files provided' }, { status: 400 });
  }

  const isGalleryCollection = collection === 'gallery';
  const targetFolder = isGalleryCollection ? 'img' : 'uploads';
  const uploadDir = path.join(process.cwd(), 'public', targetFolder);

  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  try {
    const uploadedFiles = [];
    const sharp = await getSharp();

    for (const file of files) {
      const { buffer, isCompressed } = await prepareFileBuffer(file);
      let safeName = sanitizeFilename(file.name || 'image');

      if (isCompressed) {
        const parsed = path.parse(safeName);
        safeName = `${parsed.name}.jpg`;
      }

      const prefix = isGalleryCollection ? 'gallery-' : '';
      const createdAt = new Date().toISOString();
      const filename = `${prefix}${Date.now()}-${safeName}`;
      const filepath = path.join(uploadDir, filename);
      let width = 1200;
      let height = 1500;

      try {
        if (sharp) {
          const metadata = await sharp(buffer).metadata();
          width = metadata.width || width;
          height = metadata.height || height;
        }
      } catch (error) {
        console.error('Read upload metadata failed (ignoring):', error);
      }

      await writeFile(filepath, buffer);

      uploadedFiles.push({
        name: filename,
        url: `/${targetFolder}/${filename}`,
        src: `/${targetFolder}/${filename}`,
        caption: buildCaption(filename),
        filename,
        addedAt: createdAt,
        source: isGalleryCollection ? 'gallery-upload' : 'upload',
        deletable: true,
        width,
        height,
        aspectRatio: width / height,
      });
    }

    return NextResponse.json({
      success: true,
      url: uploadedFiles[0]?.url ?? null,
      urls: uploadedFiles.map((file) => file.url),
      uploaded: uploadedFiles,
    });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ success: false, error: 'Upload failed' }, { status: 500 });
  }
}
