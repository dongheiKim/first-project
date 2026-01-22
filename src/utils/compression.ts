import { DiaryEntry } from '../context/AppContext';

export function compress(data: DiaryEntry[]): any[] {
  // 각 DiaryEntry를 { i, d, c }로 변환하여 간단히 압축
  return data.map(entry => ({
    i: entry.id,
    d: entry.date,
    c: entry.content
  }));
}

export function decompress(data: any[]): DiaryEntry[] {
  // { i, d, c }를 DiaryEntry로 복원
  return data.map(item => ({
    id: item.i,
    date: item.d,
    content: item.c
  }));
}
