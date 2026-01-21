/**
 * Data Processing Web Worker
 * 메인 스레드 블로킹 방지를 위한 백그라운드 처리
 */

// 압축 알고리즘 (메인 프로세스와 동일)
function compressData(entries) {
  return entries.map(entry => ({
    i: entry.id,
    d: entry.date,
    c: entry.content,
    ...(entry.images && { img: entry.images }),
  }));
}

function decompressData(compressed) {
  return compressed.map(item => ({
    id: item.i,
    date: item.d,
    content: item.c,
    ...(item.img && { images: item.img }),
  }));
}

// 메시지 수신
self.onmessage = function(event) {
  const { type, data } = event.data;

  try {
    let result;

    switch (type) {
      case 'COMPRESS':
        result = compressData(data);
        self.postMessage({ 
          type: 'COMPRESS_DONE',
          result,
        });
        break;

      case 'DECOMPRESS':
        result = decompressData(data);
        self.postMessage({
          type: 'DECOMPRESS_DONE',
          result,
        });
        break;

      case 'VALIDATE':
        // 데이터 검증 (대용량 파일용)
        const isValid = Array.isArray(data) && data.every(entry => 
          entry.i && entry.d && entry.c // 압축 형식
        );
        self.postMessage({
          type: 'VALIDATE_DONE',
          result: isValid,
        });
        break;

      case 'PROCESS_BATCH':
        // 배치 처리 (이미지 처리 등)
        const { batch, operation } = data;
        let processed = [];
        
        if (operation === 'PARSE_JSON') {
          processed = JSON.parse(batch);
        } else if (operation === 'STRINGIFY') {
          processed = JSON.stringify(batch);
        }
        
        self.postMessage({
          type: 'PROCESS_BATCH_DONE',
          result: processed,
        });
        break;

      default:
        throw new Error(`Unknown operation: ${type}`);
    }
  } catch (error) {
    self.postMessage({
      type: 'ERROR',
      error: error.message,
    });
  }
};
