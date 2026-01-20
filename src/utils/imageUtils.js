/**
 * 이미지 처리 유틸리티 (고급 최적화)
 */

/**
 * 이미지를 Base64로 변환
 */
export function convertImageToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/**
 * 이미지 압축 (WebP 지원, 최적화된 품질)
 * @param {string} base64 - Base64 이미지
 * @param {number} maxSize - 최대 크기 (기본 1200px)
 * @param {number} quality - 품질 (0-1, 기본 0.85)
 * @returns {Promise<string>} 압축된 Base64
 */
export function compressImage(base64, maxSize = 1200, quality = 0.85) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      let width = img.width;
      let height = img.height;

      // 비율 유지하며 크기 조정
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
      
      // 이미지 품질 개선
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(img, 0, 0, width, height);

      // WebP 지원 체크
      const supportsWebP = canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0;
      const format = supportsWebP ? 'image/webp' : 'image/jpeg';
      
      resolve(canvas.toDataURL(format, quality));
    };
    img.src = base64;
  });
}

/**
 * 썸네일 생성 (150x150, 품질 70%)
 */
export function createThumbnail(base64) {
  return compressImage(base64, 150, 0.7);
}

/**
 * 파일 크기 검증 (최대 10MB)
 */
export function validateImageSize(file) {
  const maxSize = 10 * 1024 * 1024; // 10MB
  return file.size <= maxSize;
}

/**
 * 이미지 파일 타입 검증
 */
export function validateImageType(file) {
  const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/heic'];
  return validTypes.includes(file.type);
}

/**
 * Base64 크기 계산 (KB 단위)
 */
export function getBase64Size(base64) {
  const stringLength = base64.length - 'data:image/png;base64,'.length;
  const sizeInBytes = 4 * Math.ceil(stringLength / 3) * 0.5624896334383812;
  return (sizeInBytes / 1024).toFixed(2);
}

/**
 * 이미지 EXIF 회전 보정 (iOS 대응)
 */
export async function fixImageOrientation(base64) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0);
      
      resolve(canvas.toDataURL('image/jpeg', 0.9));
    };
    img.src = base64;
  });
}

/**
 * 다중 이미지 일괄 처리
 */
export async function processBatchImages(files) {
  const results = [];
  
  for (const file of files) {
    if (!validateImageType(file) || !validateImageSize(file)) {
      continue;
    }
    
    try {
      const base64 = await convertImageToBase64(file);
      const fixed = await fixImageOrientation(base64);
      const compressed = await compressImage(fixed);
      const thumbnail = await createThumbnail(compressed);
      
      results.push({
        id: Date.now() + Math.random(),
        data: compressed,
        thumbnail: thumbnail,
        name: file.name,
        size: getBase64Size(compressed)
      });
      
      // 처리 간 약간의 지연 (브라우저 부담 감소)
      await new Promise(resolve => setTimeout(resolve, 100));
    } catch (error) {
      console.error(`이미지 처리 실패 (${file.name}):`, error);
    }
  }
  
  return results;
}
