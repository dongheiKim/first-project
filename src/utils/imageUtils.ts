export interface ImageDimensions {
  width: number;
  height: number;
}

export function resizeImage(
  file: File,
  maxWidth: number,
  maxHeight: number,
  quality: number = 0.8
): Promise<File> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    img.onload = () => {
      let { width, height } = img;

      // 비율 유지하며 리사이즈
      if (width > maxWidth || height > maxHeight) {
        const ratio = Math.min(maxWidth / width, maxHeight / height);
        width = Math.round(width * ratio);
        height = Math.round(height * ratio);
      }

      canvas.width = width;
      canvas.height = height;

      if (!ctx) {
        reject(new Error('Canvas context not available'));
        return;
      }

      ctx.drawImage(img, 0, 0, width, height);

      canvas.toBlob(
        (blob) => {
          if (blob) {
            const resizedFile = new File([blob], file.name, {
              type: file.type,
              lastModified: Date.now(),
            });
            resolve(resizedFile);
          } else {
            reject(new Error('Failed to create blob'));
          }
        },
        file.type,
        quality
      );

      URL.revokeObjectURL(img.src);
    };

    img.onerror = () => {
      URL.revokeObjectURL(img.src);
      reject(new Error('Failed to load image'));
    };

    img.src = URL.createObjectURL(file);
  });
}

export function getImageDimensions(file: File): Promise<ImageDimensions> {
  return new Promise((resolve, reject) => {
    const img = new Image();

    img.onload = () => {
      resolve({ width: img.width, height: img.height });
      URL.revokeObjectURL(img.src);
    };

    img.onerror = () => {
      URL.revokeObjectURL(img.src);
      reject(new Error('Failed to load image'));
    };

    img.src = URL.createObjectURL(file);
  });
}

export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
}

export interface ProcessedImage {
  id: string;
  name: string;
  data: string;
  thumbnail?: string;
  size: number;
}

/**
 * Base64 데이터 크기 계산 (KB)
 */
export function getBase64Size(base64: string): number {
  const padding = (base64.match(/=/g) || []).length;
  const base64Length = base64.length;
  return Math.round((base64Length * 0.75 - padding) / 1024);
}

/**
 * 이미지 일괄 처리
 */
export async function processBatchImages(files: File[]): Promise<ProcessedImage[]> {
  const MAX_WIDTH = 1200;
  const MAX_HEIGHT = 1200;
  const QUALITY = 0.8;

  const processFile = async (file: File): Promise<ProcessedImage> => {
    const resized = await resizeImage(file, MAX_WIDTH, MAX_HEIGHT, QUALITY);
    const data = await fileToBase64(resized);
    const size = getBase64Size(data);

    return {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name: file.name,
      data,
      size,
    };
  };

  return Promise.all(files.map(processFile));
}
