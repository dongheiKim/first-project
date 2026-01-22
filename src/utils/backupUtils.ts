import { DiaryEntry } from '../context/AppContext';

export async function compressWithWorker(data: DiaryEntry[]): Promise<any[]> {
  // 실제 worker가 없으므로, 단순히 압축 함수 호출
  // 추후 workerManager 연동 시 확장 가능
  // 압축 로직은 compression.ts의 compress 사용
  const { compress } = await import('./compression');
  return compress(data);
}

export async function decompressWithWorker(data: any[]): Promise<DiaryEntry[]> {
  // 실제 worker가 없으므로, 단순히 복원 함수 호출
  const { decompress } = await import('./compression');
  return decompress(data);
}

export function exportToJson(data: DiaryEntry[]): string {
  return JSON.stringify(data);
}

export function importFromJson(json: string): DiaryEntry[] {
  return JSON.parse(json);
}
