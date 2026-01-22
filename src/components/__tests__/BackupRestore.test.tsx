import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Mock modules before importing component
vi.mock('../../utils/googleDrive');
vi.mock('../../utils/backupUtils');

import BackupRestore from '../BackupRestore';

// Test fixtures
const mockEntries = [
  { id: 1, date: '2026-01-01', content: 'test entry' },
];

const emptyEntries: typeof mockEntries = [];

describe('BackupRestore component', () => {
  const mockOnImport = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('기본 렌더링', () => {
    it('Export/Import 버튼을 렌더링한다', async () => {
      await act(async () => {
        render(<BackupRestore entries={mockEntries} onImport={mockOnImport} />);
      });

      expect(screen.getByRole('button', { name: /내보내기|Export/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /가져오기|Import/i })).toBeInTheDocument();
    });

    it('Google Sign In 버튼을 렌더링한다', async () => {
      await act(async () => {
        render(<BackupRestore entries={mockEntries} onImport={mockOnImport} />);
      });

      expect(screen.getByRole('button', { name: /Sign in with Google|구글 로그인/i })).toBeInTheDocument();
    });
  });

  describe('Export 기능', () => {
    it('데이터가 없으면 안내 메시지를 표시한다', async () => {
      await act(async () => {
        render(<BackupRestore entries={emptyEntries} onImport={mockOnImport} />);
      });

      await act(async () => {
        fireEvent.click(screen.getByRole('button', { name: /내보내기|Export/i }));
      });

      await waitFor(() => {
        expect(screen.getByRole('alert')).toHaveTextContent(/내보낼 데이터가 없습니다|No data to export/i);
      });
    });

    it('압축 실패 시 에러 메시지를 표시한다', async () => {
      const { compressWithWorker } = await import('../../utils/backupUtils');
      vi.mocked(compressWithWorker).mockRejectedValueOnce(new Error('압축 실패'));

      await act(async () => {
        render(<BackupRestore entries={mockEntries} onImport={mockOnImport} />);
      });

      await act(async () => {
        fireEvent.click(screen.getByRole('button', { name: /내보내기|Export/i }));
      });

      await waitFor(() => {
        expect(screen.getByRole('alert')).toHaveTextContent(/Invalid file format|에러|error|실패/i);
      });
    });
  });

  describe('Import 기능', () => {
    it('잘못된 파일 형식이면 에러 메시지를 표시한다', async () => {
      await act(async () => {
        render(<BackupRestore entries={mockEntries} onImport={mockOnImport} />);
      });

      const file = new File(['not-json'], 'bad.json', { type: 'application/json' });
      const importButton = screen.getByRole('button', { name: /가져오기|Import/i });
      const fileInput = importButton.parentElement?.querySelector('input[type="file"]') as HTMLInputElement;

      await act(async () => {
        Object.defineProperty(fileInput, 'files', { value: [file] });
        fireEvent.change(fileInput);
      });

      await waitFor(() => {
        expect(screen.getByRole('alert')).toHaveTextContent(/Invalid file format|에러|error|실패|JSON/i);
      });
    });
  });

  describe('Google Drive 기능', () => {
    it('로그인 후 업로드 실패 시 에러 메시지를 표시한다', async () => {
      const { isSignedIn, uploadToDrive } = await import('../../utils/googleDrive');
      const { compressWithWorker } = await import('../../utils/backupUtils');
      
      // 이미 로그인된 상태로 mock 설정
      vi.mocked(isSignedIn).mockReturnValue(true);
      vi.mocked(uploadToDrive).mockRejectedValueOnce(new Error('업로드 실패'));
      vi.mocked(compressWithWorker).mockResolvedValue([{ i: 1, d: '2026-01-01', c: 'test' }]);

      await act(async () => {
        render(<BackupRestore entries={mockEntries} onImport={mockOnImport} />);
      });

      // isSignedIn이 true이므로 바로 Upload to Drive 버튼이 보임
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /Upload to Drive/i })).toBeInTheDocument();
      });

      // 업로드 버튼 클릭
      const uploadBtn = screen.getByRole('button', { name: /Upload to Drive/i });
      await act(async () => {
        fireEvent.click(uploadBtn);
      });

      // 에러 메시지 확인
      await waitFor(() => {
        expect(screen.getByRole('alert')).toHaveTextContent(/Sync error|에러|error|실패/i);
      });
    });
  });
});

