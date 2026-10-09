import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const IMAGE_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.gif', '.webp']);
const metadataCache = globalThis.__galleryMetadataCache ?? new Map();
const NO_STORE_HEADERS = {
  'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
  Pragma: 'no-cache',
  Expires: '0',
};

if (!globalThis.__galleryMetadataCache) {
  globalThis.__galleryMetadataCache = metadataCache;
}

let sharpModulePromise;

function isGalleryImage(file) {
  const ext = path.extname(file).toLowerCase();
  return IMAGE_EXTENSIONS.has(ext) && (
    file.startsWith('compressed-') ||
    file.startsWith('gallery-')
  );
}

function buildCaption(file) {
  const filename = path.basename(file, path.extname(file));

  return filename
    .replace(/^compressed-/, '')
    .replace(/^gallery-\d+-/, '')
    .replace(/^gallery-/, '')
    .replace(/[-_]+/g, ' ')
    .trim();
}

function parseNonNegativeInt(value, fallback) {
  const parsed = Number.parseInt(value ?? '', 10);

  if (Number.isNaN(parsed) || parsed < 0) {
    return fallback;
  }

  return parsed;
}

async function getSharp() {
  if (!sharpModulePromise) {
    sharpModulePromise = import('sharp')
      .then((module) => module.default)
      .catch((error) => {
        console.error('Sharp is unavailable for gallery metadata, using fallback dimensions:', error);
        return null;
      });
  }

  return sharpModulePromise;
}

function collectAncestorImageDirectories(startDirectory, maxDepth = 8) {
  const directories = [];
  let currentDirectory = path.resolve(startDirectory);

  for (let depth = 0; depth <= maxDepth; depth += 1) {
    directories.push(path.join(currentDirectory, 'public', 'img'));
    directories.push(path.join(currentDirectory, '.next', 'standalone', 'public', 'img'));

    const parentDirectory = path.dirname(currentDirectory);

    if (parentDirectory === currentDirectory) {
      break;
    }

    currentDirectory = parentDirectory;
  }

  return directories;
}

function getCandidateDirectories() {
  const moduleDir = path.dirname(fileURLToPath(import.meta.url));
  const envCandidates = [
    process.env.GALLERY_IMAGE_DIR,
    process.env.IMAGE_GALLERY_DIR,
    process.env.NEXT_PUBLIC_GALLERY_IMAGE_DIR,
  ].filter(Boolean);

  return [
    ...envCandidates,
    ...collectAncestorImageDirectories(process.cwd()),
    ...collectAncestorImageDirectories(moduleDir),
  ];
}

function resolveImageDirectory() {
  const candidates = [...new Set(getCandidateDirectories().map((item) => path.resolve(item)))];

  for (const candidate of candidates) {
    if (!fs.existsSync(candidate)) {
      continue;
    }

    const matchingFiles = fs.readdirSync(candidate).filter(isGalleryImage);

    if (matchingFiles.length > 0) {
      return {
        directory: candidate,
        files: matchingFiles,
      };
    }
  }

  for (const candidate of candidates) {
    if (fs.existsSync(candidate)) {
      return {
        directory: candidate,
        files: [],
      };
    }
  }

  return {
    directory: null,
    files: [],
  };
}

async function getImageMetadata(fullPath, stats) {
  const cacheKey = `${fullPath}:${stats.mtimeMs}:${stats.size}`;
  const cachedMetadata = metadataCache.get(cacheKey);

  if (cachedMetadata) {
    return cachedMetadata;
  }

  try {
    const sharp = await getSharp();

    if (!sharp) {
      throw new Error('sharp unavailable');
    }

    const metadata = await sharp(fullPath).metadata();
    const normalized = {
      width: metadata.width || 1200,
      height: metadata.height || 1500,
    };

    metadataCache.set(cacheKey, normalized);
    return normalized;
  } catch {
    const fallback = { width: 1200, height: 1500 };
    metadataCache.set(cacheKey, fallback);
    return fallback;
  }
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const offset = parseNonNegativeInt(searchParams.get('offset'), 0);
    const limitValue = searchParams.get('limit');
    const limit = limitValue === null ? null : Math.max(1, parseNonNegativeInt(limitValue, 80));
    const { directory: imgDir, files } = resolveImageDirectory();

    if (!imgDir) {
      return NextResponse.json([], { headers: NO_STORE_HEADERS });
    }

    const builtInImages = [];
    const uploadedImages = [];

    const imageEntries = await Promise.all(files.map(async (file) => {
      const fullPath = path.join(imgDir, file);
      const stats = fs.statSync(fullPath);
      const { width, height } = await getImageMetadata(fullPath, stats);

      return {
        src: `/img/${file}`,
        caption: buildCaption(file),
        filename: file,
        addedAt: stats.mtime.toISOString(),
        source: file.startsWith('gallery-') ? 'gallery-upload' : 'gallery-library',
        deletable: true,
        width,
        height,
        aspectRatio: width / height,
      };
    }));

    imageEntries.forEach((image) => {
      if (image.filename.startsWith('gallery-')) {
        uploadedImages.push(image);
      } else {
        builtInImages.push(image);
      }
    });

    uploadedImages.sort((a, b) => new Date(b.addedAt) - new Date(a.addedAt));
    builtInImages.sort((a, b) => a.filename.localeCompare(b.filename));

    const allImages = [...uploadedImages, ...builtInImages];

    if (limit === null) {
      return NextResponse.json(allImages, { headers: NO_STORE_HEADERS });
    }

    const items = allImages.slice(offset, offset + limit);

    return NextResponse.json(
      {
        items,
        total: allImages.length,
        hasMore: offset + items.length < allImages.length,
        offset,
        limit,
      },
      { headers: NO_STORE_HEADERS },
    );
  } catch (error) {
    console.error('Error reading image directory:', error);
    return NextResponse.json(
      { error: 'Failed to list images' },
      { status: 500, headers: NO_STORE_HEADERS },
    );
  }
}
