export function drawRoundedRect(ctx, x, y, width, height, radius) {
  const nextRadius = Math.min(radius, width / 2, height / 2);

  ctx.beginPath();
  ctx.moveTo(x + nextRadius, y);
  ctx.lineTo(x + width - nextRadius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + nextRadius);
  ctx.lineTo(x + width, y + height - nextRadius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - nextRadius, y + height);
  ctx.lineTo(x + nextRadius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - nextRadius);
  ctx.lineTo(x, y + nextRadius);
  ctx.quadraticCurveTo(x, y, x + nextRadius, y);
  ctx.closePath();
}

export function wrapText(ctx, text, maxWidth) {
  const normalized = `${text || ''}`.replace(/\r\n/g, '\n');
  const paragraphs = normalized.split('\n');
  const lines = [];

  paragraphs.forEach((paragraph, paragraphIndex) => {
    if (!paragraph.trim()) {
      lines.push('');
      return;
    }

    let current = '';

    [...paragraph].forEach((character) => {
      const candidate = current + character;

      if (ctx.measureText(candidate).width <= maxWidth || current.length === 0) {
        current = candidate;
        return;
      }

      lines.push(current);
      current = character;
    });

    if (current) {
      lines.push(current);
    }

    if (paragraphIndex < paragraphs.length - 1) {
      lines.push('');
    }
  });

  return lines;
}

export function fitImageCover(ctx, image, x, y, width, height) {
  const imageRatio = image.width / image.height;
  const targetRatio = width / height;
  let drawWidth = width;
  let drawHeight = height;
  let offsetX = x;
  let offsetY = y;

  if (imageRatio > targetRatio) {
    drawWidth = height * imageRatio;
    offsetX = x - (drawWidth - width) / 2;
  } else {
    drawHeight = width / imageRatio;
    offsetY = y - (drawHeight - height) / 2;
  }

  ctx.drawImage(image, offsetX, offsetY, drawWidth, drawHeight);
}

export function downloadCanvas(canvas, filename) {
  if (!canvas) {
    return;
  }

  canvas.toBlob((blob) => {
    if (!blob) {
      return;
    }

    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = filename;
    anchor.click();
    URL.revokeObjectURL(url);
  }, 'image/png');
}

export function loadImage(src) {
  return new Promise((resolve, reject) => {
    if (!src) {
      resolve(null);
      return;
    }

    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = reject;
    image.src = src;
  });
}

export function setCanvasSize(canvas, width, height) {
  const ratio = typeof window === 'undefined' ? 1 : Math.max(window.devicePixelRatio || 1, 1);
  canvas.width = Math.round(width * ratio);
  canvas.height = Math.round(height * ratio);
  canvas.style.aspectRatio = `${width} / ${height}`;

  const ctx = canvas.getContext('2d');
  ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
  return ctx;
}
