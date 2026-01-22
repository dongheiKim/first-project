import { useEffect, useRef, useState } from 'react';
import { ko } from '../locales/ko';
import { useTranslation } from '../locales';
import {
  initializeGoogleAPI,
  initializeGIS,
  authenticateGoogle,
  uploadToDrive,
  downloadFromDrive,
  signOutGoogle,
  isSignedIn,
} from '../utils/googleDrive';
import { compressWithWorker, decompressWithWorker } from '../utils/backupUtils';

export type DiaryEntry = {
  id: number;
  date: string;
  content: string;
};


export type BackupRestoreProps = {
  entries: DiaryEntry[];
  onImport: (data: DiaryEntry[]) => void;
  testOnlyGoogleSignedIn?: boolean;
};


const BackupRestore = ({ entries, onImport, testOnlyGoogleSignedIn }: BackupRestoreProps) => {
  const t = useTranslation() as typeof ko;
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [isGoogleSignedIn, setIsGoogleSignedIn] = useState(testOnlyGoogleSignedIn ?? false);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [progress] = useState(0);

  useEffect(() => {
    const init = async () => {
      try {
        await initializeGoogleAPI();
        await initializeGIS();
        setIsGoogleSignedIn(isSignedIn());
      } catch (error) {
        showMessage('error', t.syncError);
      }
    };
    init();
  }, [t]);

  // 데이터 내보내기 (압축 적용)
  const handleExport = async () => {
    if (entries.length === 0) {
      showMessage('info', t.noDataToExport);
      return;
    }
    setIsLoading(true);
    try {
      showMessage('info', t.exportData + '...');
      const compressed = await compressWithWorker(entries);
      const dataStr = JSON.stringify(compressed);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      const timestamp = new Date().toISOString().slice(0, 10);
      link.download = `diary-backup-${timestamp}.json`;
      link.href = url;
      link.click();
      URL.revokeObjectURL(url);
      const originalSize = JSON.stringify(entries).length;
      const compressedSize = dataStr.length;
      const reduction = ((1 - compressedSize / originalSize) * 100).toFixed(1);
      showMessage('success', `${t.exportSuccess}\n원본: ${(originalSize / 1024).toFixed(1)} KB\n압축: ${(compressedSize / 1024).toFixed(1)} KB\n감소율: ${reduction}%`);
    } catch (error) {
      showMessage('error', t.importError);
    } finally {
      setIsLoading(false);
    }
  };

  // 파일 선택 트리거
  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  // 데이터 가져오기 (압축 해제)
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsLoading(true);
    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        showMessage('info', t.importData + '...');
        const parsedData = JSON.parse(event.target?.result as string);
        let importedData;
        if (Array.isArray(parsedData) && parsedData.length > 0) {
          if (parsedData[0].i !== undefined) {
            importedData = await decompressWithWorker(parsedData);
          } else if (parsedData[0].id !== undefined) {
            importedData = parsedData;
          } else {
            showMessage('error', t.importError + ' (format)');
            setIsLoading(false);
            return;
          }
        } else {
          showMessage('error', t.importError + ' (empty)');
          setIsLoading(false);
          return;
        }
        const isValid = importedData.every(
          (entry: DiaryEntry) => entry.id !== undefined && entry.date && entry.content
        );
        if (!isValid) {
          showMessage('error', t.importError + ' (entry)');
          setIsLoading(false);
          return;
        }
        if (entries.length > 0) {
          if (!window.confirm(t.confirmImport)) {
            setIsLoading(false);
            return;
          }
        }
        onImport(importedData);
        showMessage('success', t.importSuccess);
      } catch (error: any) {
        showMessage('error', t.importError + (error?.message ? `: ${error.message}` : ''));
        if (typeof process !== 'undefined' && process.env.NODE_ENV === 'development') {
          console.error('Import error:', error);
        }
      } finally {
        setIsLoading(false);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  // 구글 로그인
  const handleGoogleSignIn = async () => {
    try {
      setIsLoading(true);
      showMessage('info', t.signInGoogle + '...');
      await authenticateGoogle();
      setIsGoogleSignedIn(true);
      showMessage('success', t.syncSuccess);
    } catch (error: any) {
      showMessage('error', t.syncError + (error?.message ? `: ${error.message}` : ''));
      if (typeof process !== 'undefined' && process.env.NODE_ENV === 'development') {
        console.error('Sign in error:', error);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // 구글 로그아웃
  const handleGoogleSignOut = () => {
    signOutGoogle();
    setIsGoogleSignedIn(false);
  };

  // 구글 드라이브에 업로드 (압축 적용)
  const handleUploadToDrive = async () => {
    if (!isGoogleSignedIn) {
      showMessage('info', t.notSignedIn);
      return;
    }
    if (entries.length === 0) {
      showMessage('info', t.noDataToExport);
      return;
    }
    try {
      setIsLoading(true);
      showMessage('info', t.uploadToDrive + '...');
      const compressed = await compressWithWorker(entries);
      const dataStr = JSON.stringify(compressed);
      await uploadToDrive('diary-backup.json', dataStr);
      const reduction = ((1 - dataStr.length / JSON.stringify(entries).length) * 100).toFixed(1);
      showMessage('success', `${t.syncSuccess}\n크기 감소: ${reduction}%`);
    } catch (error: any) {
      showMessage('error', t.syncError + (error?.message ? `: ${error.message}` : ''));
      if (typeof process !== 'undefined' && process.env.NODE_ENV === 'development') {
        console.error('Upload error:', error);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // 구글 드라이브에서 다운로드 (압축 해제)
  const handleDownloadFromDrive = async () => {
    if (!isGoogleSignedIn) {
      showMessage('info', t.notSignedIn);
      return;
    }
    try {
      setIsLoading(true);
      showMessage('info', t.downloadFromDrive + '...');
      const dataStr = await downloadFromDrive('diary-backup.json');
      const parsedData = JSON.parse(dataStr);
      let importedData;
      if (parsedData.length > 0 && parsedData[0].i !== undefined) {
        importedData = await decompressWithWorker(parsedData);
      } else {
        importedData = parsedData;
      }
      if (!Array.isArray(importedData)) {
        showMessage('error', t.importError + ' (format)');
        setIsLoading(false);
        return;
      }
      if (entries.length > 0) {
        if (!window.confirm(t.confirmImport)) {
          setIsLoading(false);
          return;
        }
      }
      onImport(importedData);
      showMessage('success', t.syncSuccess);
    } catch (error: any) {
      showMessage('error', t.syncError + (error?.message ? `: ${error.message}` : ''));
      if (typeof process !== 'undefined' && process.env.NODE_ENV === 'development') {
        console.error('Download error:', error);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // 메시지 표시 (타입: success, error, info)
  const showMessage = (type: string, text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 4000);
  };

  return (
    <div className="backup-section" role="region" aria-label={t.backupTitle as string}>
      <h3 tabIndex={0}>{t.backupTitle}</h3>
      <div className="backup-buttons">
        <button className="btn-export" onClick={handleExport} disabled={isLoading} aria-label={t.exportData as string} tabIndex={0}>
          {t.exportData}
        </button>
        <button className="btn-import" onClick={handleImportClick} disabled={isLoading} aria-label={t.importData as string} tabIndex={0}>
          {t.importData}
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".json"
          onChange={handleFileChange}
          style={{ display: 'none' }}
        />
      </div>
      {/* 메시지 영역 (Toast 스타일) */}
      {message.text && (
        <div 
          className={`toast-message toast-${message.type}`}
          role="alert" 
          aria-live="assertive" 
          tabIndex={0}
          style={{
            color: message.type === 'error' ? 'red' : message.type === 'success' ? 'green' : '#333',
            background: '#fff',
            border: `1px solid ${message.type === 'error' ? 'red' : message.type === 'success' ? 'green' : '#aaa'}`,
            borderRadius: '6px',
            padding: '8px 16px',
            margin: '8px 0',
            boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
            maxWidth: 400,
            whiteSpace: 'pre-line',
            fontWeight: 500
          }}
        >
          {message.text}
        </div>
      )}
      {/* 진행률 바 예시 */}
      {progress > 0 && (
        <div className="progress-bar" aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100} role="progressbar" aria-label="백업 진행률">
          <div className="progress" style={{ width: `${progress}%`, background: '#4caf50', height: '8px' }} />
        </div>
      )}
      {/* 구글 드라이브 섹션 */}
      <div className="google-drive-section">
        <h4 tabIndex={0}>{t.googleDriveSync}</h4>
        {!isGoogleSignedIn ? (
          <button 
            className="btn-google-signin" 
            onClick={handleGoogleSignIn}
            disabled={isLoading}
            aria-label={t.signInGoogle as string}
            tabIndex={0}
          >
            {isLoading ? '⏳ 로딩...' : t.signInGoogle}
          </button>
        ) : (
          <div className="google-drive-actions">
            <button 
              className="btn-drive-upload" 
              onClick={handleUploadToDrive}
              disabled={isLoading}
              aria-label={t.uploadToDrive as string}
              tabIndex={0}
            >
              {isLoading ? '⏳' : t.uploadToDrive}
            </button>
            <button 
              className="btn-drive-download" 
              onClick={handleDownloadFromDrive}
              disabled={isLoading}
              aria-label={t.downloadFromDrive as string}
              tabIndex={0}
            >
              {isLoading ? '⏳' : t.downloadFromDrive}
            </button>
            <button 
              className="btn-google-signout" 
              onClick={handleGoogleSignOut}
              disabled={isLoading}
              aria-label={t.signOutGoogle as string}
              tabIndex={0}
            >
              {t.signOutGoogle}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default BackupRestore;
