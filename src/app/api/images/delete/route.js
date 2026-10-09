import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import fsSync from 'fs';
import path from 'path';
import { cookies } from 'next/headers';

function collectPublicRoots(startDirectory, maxDepth = 8) {
  const roots = [];
  let currentDirectory = path.resolve(startDirectory);

  for (let depth = 0; depth <= maxDepth; depth += 1) {
    roots.push(path.join(currentDirectory, 'public'));
    roots.push(path.join(currentDirectory, '.next', 'standalone', 'public'));

    const parentDirectory = path.dirname(currentDirectory);

    if (parentDirectory === currentDirectory) {
      break;
    }

    currentDirectory = parentDirectory;
  }

  return roots;
}

function normalizeInputPaths(payload) {
  if (Array.isArray(payload?.paths)) {
    return payload.paths;
  }

  if (typeof payload?.path === 'string') {
    return [payload.path];
  }

  return [];
}

function resolvePublicImagePath(imagePath) {
  if (typeof imagePath !== 'string' || !imagePath.startsWith('/img/')) {
    return null;
  }

  const normalized = path.posix.normalize(imagePath);

  if (!normalized.startsWith('/img/')) {
    return null;
  }

  const relativePath = normalized.slice(1);
  const candidates = [...new Set(collectPublicRoots(process.cwd()))];

  for (const root of candidates) {
    const fullPath = path.join(root, relativePath);

    if (fsSync.existsSync(fullPath)) {
      return fullPath;
    }
  }

  return path.join(candidates[0], relativePath);
}

export async function DELETE(request) {
  try {
    const token = (await cookies()).get('admin_token');

    if (!token || token.value !== 'authenticated') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload = await request.json();
    const imagePaths = [...new Set(normalizeInputPaths(payload))];

    if (imagePaths.length === 0) {
      return NextResponse.json({ error: 'Invalid image path' }, { status: 400 });
    }

    const deleted = [];
    const failed = [];

    for (const imagePath of imagePaths) {
      const fullPath = resolvePublicImagePath(imagePath);

      if (!fullPath) {
        failed.push({ path: imagePath, error: 'Invalid image path' });
        continue;
      }

      try {
        await fs.unlink(fullPath);
        deleted.push(imagePath);
      } catch (error) {
        failed.push({
          path: imagePath,
          error: error?.code === 'ENOENT' ? 'File not found' : 'Delete failed',
        });
      }
    }

    if (deleted.length === 0) {
      return NextResponse.json({ error: 'Delete failed', deleted, failed }, { status: 404 });
    }

    return NextResponse.json({
      success: failed.length === 0,
      deleted,
      failed,
    });
  } catch (error) {
    console.error('Delete image error:', error);
    return NextResponse.json({ error: 'Delete failed' }, { status: 500 });
  }
}
