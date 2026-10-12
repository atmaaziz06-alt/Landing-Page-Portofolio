import { isProtectedProjectCategory } from './media';

const WATERMARK_TEXT = 'Vezta Studio';
const SUPPORTED_IMAGE_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);

export async function applyWatermark(file, category) {
  if (!isProtectedProjectCategory(category) || !file.type.startsWith('image/')) {
    return file;
  }

  if (!SUPPORTED_IMAGE_TYPES.has(file.type)) {
    throw new Error('Watermark hanya mendukung gambar JPG, PNG, atau WebP. Ubah format gambar sebelum mengunggah.');
  }

  let bitmap;
  try {
    bitmap = await createImageBitmap(file);
    const canvas = document.createElement('canvas');
    canvas.width = bitmap.width;
    canvas.height = bitmap.height;

    const context = canvas.getContext('2d');
    if (!context) {
      throw new Error('Browser tidak dapat memproses watermark gambar ini.');
    }

    context.drawImage(bitmap, 0, 0);
    context.save();
    context.globalAlpha = 0.42;
    context.font = `700 ${Math.max(24, Math.min(72, Math.round(canvas.width * 0.045)))}px sans-serif`;
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.lineWidth = 3;
    context.strokeStyle = 'rgba(0, 0, 0, 0.8)';
    context.fillStyle = 'rgba(255, 255, 255, 0.95)';

    const spacingX = Math.max(220, Math.round(canvas.width * 0.34));
    const spacingY = Math.max(150, Math.round(canvas.height * 0.28));
    for (let y = -canvas.height; y <= canvas.height * 2; y += spacingY) {
      for (let x = -canvas.width; x <= canvas.width * 2; x += spacingX) {
        context.save();
        context.translate(x, y);
        context.rotate(-Math.PI / 4);
        context.strokeText(WATERMARK_TEXT, 0, 0);
        context.fillText(WATERMARK_TEXT, 0, 0);
        context.restore();
      }
    }
    context.restore();

    const watermarkedBlob = await new Promise((resolve, reject) => {
      canvas.toBlob(
        (blob) => blob
          ? resolve(blob)
          : reject(new Error('Gagal membuat gambar watermark. Coba gunakan file gambar lain.')),
        file.type,
        file.type === 'image/jpeg' || file.type === 'image/webp' ? 0.92 : undefined
      );
    });

    return new File([watermarkedBlob], file.name, {
      type: file.type,
      lastModified: file.lastModified
    });
  } finally {
    bitmap?.close();
  }
}
