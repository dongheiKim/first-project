import { useRef, useState, useEffect } from 'react';
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
import { compressData, decompressData } from '../utils/compression';

/**
 * 백업 & 복원 컴포넌트
 * JSON 파일로 데이터 내보내기/가져오기 + 구글 드라이브 동기화
 * @param {Array} entries - 일기 데이터
 * @param {Function} onImport - 데이터 가져오기 콜백
 */
export function BackupRestore({ entries, onImport }) {
  const t = useTranslation();
  const fileInputRef = useRef(null);
  const [isGoogleSignedIn, setIsGoogleSignedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [progress, setProgress] = useState(0);

  // Google API 초기화
  useEffect(() => {
    const init = async () => {
      try {
        await initializeGoogleAPI();
        await initializeGIS();
        setIsGoogleSignedIn(isSignedIn());
      } catch (error) {
      setTimeout(() => setErrorMsg(""), 5000);
      }
    };
    init();
  }, []);

  // 데이터 내보내기 (압축 적용)
  const handleExport = () => {
    if (entries.length === 0) {
      alert(t.noDataToExport);
      return;
    }
    const compressed = compressData(entries);
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
    alert(`${t.exportSuccess}\n원본: ${(originalSize / 1024).toFixed(1)} KB\n압축: ${(compressedSize / 1024).toFixed(1)} KB\n감소율: ${reduction}%`);
  };

  // 파일 선택 트리거
  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  // 데이터 가져오기 (압축 해제)
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsedData = JSON.parse(event.target?.result);
        let importedData;
        if (Array.isArray(parsedData) && parsedData.length > 0) {
          if (parsedData[0].i !== undefined) {
            importedData = decompressData(parsedData);
          } else if (parsedData[0].id !== undefined) {
            importedData = parsedData;
          } else {
            throw new Error('Invalid format');
          }
        } else {
          throw new Error('Invalid format');
        }
        const isValid = importedData.every(
          (entry) => entry.id && entry.date && entry.content
        );
        if (!isValid) {
          throw new Error('Invalid entry format');
        }
        if (entries.length > 0) {
          if (!window.confirm(t.confirmImport)) {
            return;
          }
        }
        onImport(importedData);
        alert(t.importSuccess);
      } catch (error) {
        showError(t.importError);
        console.error('Import error:', error);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  // 구글 로그인
  const handleGoogleSignIn = async () => {
    try {
      setIsLoading(true);
      await authenticateGoogle();
      setIsGoogleSignedIn(true);
    } catch (error) {
      console.error('Sign in error:', error);
      alert(t.syncError);
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
      alert(t.notSignedIn);
      return;
    }
    if (entries.length === 0) {
      alert(t.noDataToExport);
      return;
    }
    try {
      setIsLoading(true);
      const compressed = compressData(entries);
      const dataStr = JSON.stringify(compressed);
      await uploadToDrive('diary-backup.json', dataStr);
      const reduction = ((1 - dataStr.length / JSON.stringify(entries).length) * 100).toFixed(1);
      alert(`${t.syncSuccess}\n크기 감소: ${reduction}%`);
    } catch (error) {
      console.error('Upload error:', error);
      alert(t.syncError);
    } finally {
      setIsLoading(false);
    }
  };

  // 구글 드라이브에서 다운로드 (압축 해제)
  const handleDownloadFromDrive = async () => {
    if (!isGoogleSignedIn) {
      alert(t.notSignedIn);
      return;
    }
    try {
      setIsLoading(true);
      const dataStr = await downloadFromDrive('diary-backup.json');
      const parsedData = JSON.parse(dataStr);
      let importedData;
      if (parsedData.length > 0 && parsedData[0].i !== undefined) {
        importedData = decompressData(parsedData);
      } else {
        importedData = parsedData;
      }
      if (!Array.isArray(importedData)) {
        throw new Error('Invalid format');
      }
      if (entries.length > 0) {
        if (!window.confirm(t.confirmImport)) {
          setIsLoading(false);
          return;
        }
      }
      onImport(importedData);
      alert(t.syncSuccess);
    } catch (error) {
      console.error('Download error:', error);
      alert(t.syncError);
    } finally {
      setIsLoading(false);
    }
  };

  // 에러 메시지 표시
  const showError = (msg) => {
    setErrorMsg(msg);
    setTimeout(() => setErrorMsg("") , 5000);
  };

  return (
    <div className="backup-section" role="region" aria-label={t.backupTitle}>
      <h3 tabIndex={0}>{t.backupTitle}</h3>
      <div className="backup-buttons">
        <button className="btn-export" onClick={handleExport} disabled={isLoading} aria-label={t.exportData} tabIndex={0}>
          {t.exportData}
        </button>
        <button className="btn-import" onClick={handleImportClick} disabled={isLoading} aria-label={t.importData} tabIndex={0}>
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
      {/* 에러 메시지 영역 */}
      {errorMsg && (
        <div className="error-message" role="alert" aria-live="assertive" tabIndex={0} style={{color: 'red'}}>
          {errorMsg}
        </div>
      )}
      {/* 진행률 바 예시 */}
      {progress > 0 && (
        <div className="progress-bar" aria-valuenow={progress} aria-valuemin="0" aria-valuemax="100" role="progressbar" aria-label="백업 진행률">
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
            aria-label={t.signInGoogle}
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
              aria-label={t.uploadToDrive}
              tabIndex={0}
            >
              {isLoading ? '⏳' : t.uploadToDrive}
            </button>
            <button 
              className="btn-drive-download" 
              onClick={handleDownloadFromDrive}
              disabled={isLoading}
              aria-label={t.downloadFromDrive}
              tabIndex={0}
            >
              {isLoading ? '⏳' : t.downloadFromDrive}
            </button>
            <button 
              className="btn-google-signout" 
              onClick={handleGoogleSignOut}
              disabled={isLoading}
              aria-label={t.signOutGoogle}
              tabIndex={0}
            >
              {t.signOutGoogle}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}