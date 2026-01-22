import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { toAppError, getUserMessage, safeAsync, logError } from '../errorHandler';

describe('errorHandler', () => {
  describe('toAppError', () => {
    it('Error 객체를 AppError로 변환한다', () => {
      const error = new Error('test error');
      const appError = toAppError(error);

      expect(appError.code).toBe('UNKNOWN_ERROR');
      expect(appError.message).toBeTruthy();
      expect(appError.originalError).toBe(error);
    });

    it('네트워크 에러를 감지한다', () => {
      const error = new Error('Network request failed');
      const appError = toAppError(error);

      expect(appError.code).toBe('NETWORK_ERROR');
    });

    it('인증 에러를 감지한다', () => {
      const error = new Error('Authentication failed');
      const appError = toAppError(error);

      expect(appError.code).toBe('AUTH_ERROR');
    });

    it('파일 에러를 감지한다', () => {
      const error = new Error('JSON parse error');
      const appError = toAppError(error);

      expect(appError.code).toBe('FILE_ERROR');
    });

    it('기본 코드를 지정할 수 있다', () => {
      const error = new Error('some error');
      const appError = toAppError(error, 'VALIDATION_ERROR');

      expect(appError.code).toBe('VALIDATION_ERROR');
    });
  });

  describe('getUserMessage', () => {
    it('기본 메시지를 반환한다', () => {
      const appError = toAppError(new Error('test'));
      const message = getUserMessage(appError);

      expect(typeof message).toBe('string');
      expect(message.length).toBeGreaterThan(0);
    });

    it('상세 정보를 포함할 수 있다', () => {
      const appError = toAppError(new Error('original message'));
      const message = getUserMessage(appError, true);

      expect(message).toContain('original message');
    });
  });

  describe('safeAsync', () => {
    it('성공 시 데이터를 반환한다', async () => {
      const fn = vi.fn().mockResolvedValue('success');
      const result = await safeAsync(fn);

      expect(result.data).toBe('success');
      expect(result.error).toBeNull();
    });

    it('실패 시 에러를 반환한다', async () => {
      const fn = vi.fn().mockRejectedValue(new Error('failed'));
      const result = await safeAsync(fn);

      expect(result.data).toBeNull();
      expect(result.error).not.toBeNull();
      expect(result.error?.code).toBeTruthy();
    });

    it('onError 콜백을 호출한다', async () => {
      const fn = vi.fn().mockRejectedValue(new Error('failed'));
      const onError = vi.fn();

      await safeAsync(fn, { onError });

      expect(onError).toHaveBeenCalled();
    });
  });

  describe('logError', () => {
    let consoleErrorSpy: ReturnType<typeof vi.spyOn>;

    beforeEach(() => {
      consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    });

    afterEach(() => {
      consoleErrorSpy.mockRestore();
    });

    it('개발 환경에서 에러를 로깅한다', () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';

      const appError = toAppError(new Error('test'));
      logError(appError, 'TestContext');

      expect(consoleErrorSpy).toHaveBeenCalled();

      process.env.NODE_ENV = originalEnv;
    });
  });
});
