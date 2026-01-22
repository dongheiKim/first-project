export function isValidEntry(entry: any): boolean {
  // ...타입 명시 및 검증 로직...
  return !!entry && typeof entry.id === 'number' && typeof entry.date === 'string' && typeof entry.content === 'string';
}
