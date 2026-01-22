/**
 * 애플리케이션 전역 에러 처리 유틸리티
 */

export type ErrorCode = 
  | 'NETWORK_ERROR'
  | 'VALIDATION_ERROR'
  | 'AUTH_ERROR'
  | 'STORAGE_ERROR'
  | 'COMPRESSION_ERROR'
  | 'FILE_ERROR'
  | 'UNKNOWN_ERROR';

export interface AppError {
  code: ErrorCode;
  message: string;
  originalError?: Error;
}

// 에러 코드별 사용자 친화적 메시지
const errorMessages: Record<ErrorCode, string> = {
  NETWORK_ERROR: '네트워크 연결을 확인해주세요.',
  VALIDATION_ERROR: '입력 데이터가 올바르지 않습니다.',
  AUTH_ERROR: '인증에 실패했습니다. 다시 로그인해주세요.',
  STORAGE_ERROR: '저장 공간에 문제가 발생했습니다.',
  COMPRESSION_ERROR: '데이터 압축/해제 중 오류가 발생했습니다.',
  FILE_ERROR: '파일 처리 중 오류가 발생했습니다.',
  UNKNOWN_ERROR: '알 수 없는 오류가 발생했습니다.',
};

/**
 * 에러를 AppError 형식으로 변환
 */
export function toAppError(error: unknown, defaultCode: ErrorCode = 'UNKNOWN_ERROR'): AppError {
  if (error instanceof Error) {
    // 에러 메시지에서 코드 추론
    const code = inferErrorCode(error) || defaultCode;
    return {
      code,
      message: errorMessages[code],
      originalError: error,
    };
  }

  return {
    code: defaultCode,
    message: errorMessages[defaultCode],
  };
}

/**
 * 에러에서 코드 추론
 */
function inferErrorCode(error: Error): ErrorCode | null {
  const message = error.message.toLowerCase();

  if (message.includes('network') || message.includes('fetch')) {
    return 'NETWORK_ERROR';
  }
  if (message.includes('auth') || message.includes('sign') || message.includes('login')) {
    return 'AUTH_ERROR';
  }
  if (message.includes('storage') || message.includes('quota')) {
    return 'STORAGE_ERROR';
  }
  if (message.includes('compress') || message.includes('decompress')) {
    return 'COMPRESSION_ERROR';
  }
  if (message.includes('file') || message.includes('json') || message.includes('parse')) {
    return 'FILE_ERROR';
  }

  return null;
}

/**
 * 에러 로깅 (개발 환경에서만)
 */
export function logError(error: AppError, context?: string): void {
  if (typeof process !== 'undefined' && process.env.NODE_ENV === 'development') {
    console.error(`[${error.code}]${context ? ` (${context})` : ''}: ${error.message}`, error.originalError);
  }
}

/**
 * 사용자에게 표시할 에러 메시지 생성
 */
export function getUserMessage(error: AppError, includeDetails: boolean = false): string {
  if (includeDetails && error.originalError) {
    return `${error.message} (${error.originalError.message})`;
  }
  return error.message;
}

/**
 * 비동기 함수를 안전하게 실행하고 에러를 처리
 */
export async function safeAsync<T>(
  fn: () => Promise<T>,
  options: {
    defaultCode?: ErrorCode;
    context?: string;
    onError?: (error: AppError) => void;
  } = {}
): Promise<{ data: T | null; error: AppError | null }> {
  const { defaultCode = 'UNKNOWN_ERROR', context, onError } = options;

  try {
    const data = await fn();
    return { data, error: null };
  } catch (e) {
    const error = toAppError(e, defaultCode);
    logError(error, context);
    onError?.(error);
    return { data: null, error };
  }
}
