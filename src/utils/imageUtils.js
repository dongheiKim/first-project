/**
 * 이미지 처리 유틸리티
 */

export function convertImageToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export function compressImage(base64, maxSize = 1200, quality = 0.85) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      let width = img.width;
      let height = img.height;

      if (width > height) {
        if (width > maxSize) {
          height *= maxSize / width;
          width = maxSize;
        }
      } else {
        if (height > maxSize) {
          width *= maxSize / height;
          height = maxSize;
        }
      }

      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d');
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(img, 0, 0, width, height);

      const supportsWebP = canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0;
      const format = supportsWebP ? 'image/webp' : 'image/jpeg';
      
      resolve(canvas.toDataURL(format, quality));
    };
    img.src = base64;
  });
}

export function createThumbnail(base64) {
  return compressImage(base64, 150, 0.7);
}

export function validateImageSize(file) {
  const maxSize = 10 * 1024 * 1024;
  return file.size <= maxSize;
}

export function validateImageType(file) {
  const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  return validTypes.includes(file.type);
}

export function getBase64Size(base64) {
  const stringLength = base64.length - 'data:image/png;base64,'.length;
  const sizeInBytes = 4 * Math.ceil(stringLength / 3) * 0.5624896334383812;
  return (sizeInBytes / 1024).toFixed(2);
}

export async function processBatchImages(files) {
  const results = [];
  
  for (const file of files) {
    if (!validateImageType(file) || !validateImageSize(file)) {
      continue;
    }
    
    try {
      const base64 = await convertImageToBase64(file);
      const compressed = await compressImage(base64);
      const thumbnail = await createThumbnail(compressed);
      
      results.push({
        id: Date.now() + Math.random(),
        data: compressed,
        thumbnail: thumbnail,
        name: file.name,
        size: getBase64Size(compressed)
      });
      
      await new Promise(resolve => setTimeout(resolve, 100));
    } catch (error) {
      console.error(`이미지 처리 실패 (${file.name}):`, error);
    }
  }
  
  return results;
}
